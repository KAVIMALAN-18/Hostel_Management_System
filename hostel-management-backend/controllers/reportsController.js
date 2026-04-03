const User = require('../models/User');
const Student = require('../models/Student');
const Leave = require('../models/Leave');
const Room = require('../models/Room');
const Bed = require('../models/Bed');
const Attendance = require('../models/Attendance');
const Complaint = require('../models/Complaint');
const MessFeedback = require('../models/MessFeedback');
const MessMenu = require('../models/MessMenu');
const Hostel = require('../models/Hostel');

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/reports/stats
 * @access  Private (Admin/Warden)
 */
exports.getStats = async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        
        // Stats from Leave
        const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
        const onLeave = await Leave.countDocuments({ status: 'Approved' });
        
        // Stats from Rooms/Beds
        const totalRooms = await Room.countDocuments();
        const totalBeds = await Bed.countDocuments();
        const occupiedBeds = await Bed.countDocuments({ status: 'occupied' });
        
        // Stats from Attendance (Today)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayPresent = await Attendance.countDocuments({ 
            date: { $gte: todayStart },
            status: 'Present'
        });
        
        // Stats from Complaints (Maintenance)
        const maintenanceOpen = await Complaint.countDocuments({ 
            status: { $in: ['Pending', 'In Progress'] },
            category: { $in: ['Electrical', 'Plumbing', 'Furniture'] }
        });
        const maintenanceHighPriority = await Complaint.countDocuments({
            status: { $in: ['Pending', 'In Progress'] },
            priority: { $in: ['High', 'Critical'] }
        });

        // Onboarding Status
        const awaitingRoomAssign = await Student.countDocuments({ 
            allocationStatus: { $ne: 'allocated' } 
        });

        const totalOccupancy = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

        res.status(200).json({
            success: true,
            data: {
                totalStudents,
                totalRooms,
                totalBeds,
                bedsOccupied: occupiedBeds,
                totalOccupancy,
                todayPresent: todayPresent || 0,
                onApprovedLeave: onLeave,
                pendingLeaves,
                onboardingPending: awaitingRoomAssign,
                awaitingRoomAssign,
                maintenanceOpen,
                maintenanceHighPriority,
                activeComplaints: await Complaint.countDocuments({ status: 'Pending' }),
                trend: [], // Dynamic empty trend list
                biometricLogs: [], // Dynamic empty bio list
                messStats: await MessFeedback.aggregate([
                    { $group: { _id: null, avgRating: { $avg: "$rating" }, total: { $sum: 1 } } }
                ])
            }
        });
    } catch (error) {
        console.error('Stats Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics'
        });
    }
};

exports.getAttendanceReport = async (req, res) => {
    try {
        const { date, hostel } = req.query;
        
        // 1. Setup Date Filter
        const searchDate = date ? new Date(date) : new Date();
        searchDate.setHours(0, 0, 0, 0);
        const nextDate = new Date(searchDate);
        nextDate.setDate(nextDate.getDate() + 1);

        // 2. Setup Hostel Filter (Find ID if name provided)
        let studentQuery = { allocationStatus: { $in: ['allocated', 'checked-in'] } };
        if (hostel && hostel !== 'All Hostels') {
            const h = await Hostel.findOne({ name: hostel });
            if (h) studentQuery.hostel = h._id;
        }

        // 3. Find all students who SHOULD have attendance for this filter
        const students = await Student.find(studentQuery)
            .populate('user', 'name email')
            .populate('hostel', 'name')
            .populate('room', 'roomNumber');

        // 4. Find existing attendance records for the given date and these students
        const attendanceRecords = await Attendance.find({
            date: { $gte: searchDate, $lt: nextDate },
            student: { $in: students.map(s => s._id) }
        });

        // 5. Composite Report (Every expected student gets a row)
        const compositeReport = students.map(student => {
            const record = attendanceRecords.find(r => r.student.toString() === student._id.toString());
            return {
                _id: record ? record._id : `temp-${student._id}`,
                student: student,
                status: record ? record.status : 'Not Marked',
                date: record ? record.date : searchDate,
                remarks: record ? record.remarks : ''
            };
        });

        res.status(200).json({ success: true, data: compositeReport });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getLeaveReport = async (req, res) => {
    try {
        const report = await Leave.find().populate('student', 'name email');
        res.status(200).json({ success: true, data: report });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMaintenanceReport = async (req, res) => {
    try {
        // Maintenance items are typically complaints of certain categories
        const report = await Complaint.find({
            category: { $in: ['Electrical', 'Plumbing', 'Furniture'] }
        }).populate('student', 'name email');
        res.status(200).json({ success: true, data: report });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getOccupancyReport = async (req, res) => {
    try {
        const report = await Room.find();
        res.status(200).json({ success: true, data: report });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMessFeedbackReport = async (req, res) => {
    res.status(200).json({ success: true, data: [] });
};

/**
 * @desc    Get student count per hostel block (A, B, C, D)
 * @route   GET /api/reports/hostel-block-stats
 * @access  Private (Admin/Warden)
 */
exports.getHostelBlockStats = async (req, res) => {
    try {
        // Get all hostels
        const hostels = await Hostel.find();

        // Build a map: hostelId => blockName
        const hostelMap = {};
        hostels.forEach((h) => {
            hostelMap[h._id.toString()] = h;
        });

        // Count students per hostel using aggregation
        const studentCounts = await Student.aggregate([
            {
                $match: {
                    hostel: { $in: hostels.map((h) => h._id) },
                    allocationStatus: { $in: ['allocated', 'checked-in'] }
                }
            },
            {
                $group: {
                    _id: '$hostel',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Build final result for all blocks
        const blockStats = hostels.map((hostel) => {
            const found = studentCounts.find((s) => s._id.toString() === hostel._id.toString());
            return {
                block: hostel.name,
                count: found ? found.count : 0,
                capacity: hostel.capacity || 0
            };
        });

        res.status(200).json({ success: true, data: blockStats });
    } catch (error) {
        console.error('Hostel Block Stats Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching hostel block statistics'
        });
    }
};

/**
 * @desc    Get student count by allocation status
 * @route   GET /api/reports/student-distribution
 * @access  Private (Admin/Warden)
 */
exports.getStudentDistribution = async (req, res) => {
    try {
        const STATUSES = ['pending', 'allocated', 'checked-in', 'checked-out'];

        // Aggregate students grouped by allocationStatus
        const rawCounts = await Student.aggregate([
            {
                $group: {
                    _id: '$allocationStatus',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Map into a clean object keyed by status
        const countMap = {};
        rawCounts.forEach((r) => { countMap[r._id] = r.count; });

        const distribution = STATUSES.map((status) => ({
            status,
            count: countMap[status] || 0
        }));

        const total = distribution.reduce((sum, d) => sum + d.count, 0);

        res.status(200).json({ success: true, data: { distribution, total } });
    } catch (error) {
        console.error('Student Distribution Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching student distribution'
        });
    }
};
