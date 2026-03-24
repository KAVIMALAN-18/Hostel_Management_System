const User = require('../models/User');
const Student = require('../models/Student');
const Leave = require('../models/Leave');
const Room = require('../models/Room');
const Bed = require('../models/Bed');
const Attendance = require('../models/Attendance');
const Complaint = require('../models/Complaint');

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
                activeComplaints: await Complaint.countDocuments({ status: 'Pending' })
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
        const report = await Attendance.find()
            .populate({
                path: 'student',
                populate: { path: 'user', select: 'name email' }
            })
            .sort({ date: -1 });
        res.status(200).json({ success: true, data: report });
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
