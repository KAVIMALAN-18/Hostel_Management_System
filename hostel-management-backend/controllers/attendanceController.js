const { Attendance, Student, User, Warden, Hostel } = require('../models');

// @desc    Mark attendance for multiple students
// @route   POST /api/attendance/bulk
// @access  Private (Admin, Warden)
exports.markBulkAttendance = async (req, res) => {
    try {
        const { records, date } = req.body; // records: [{ studentId, status }]
        
        const attendanceDate = date ? new Date(date) : new Date();
        attendanceDate.setHours(0, 0, 0, 0);

        const results = [];
        for (const record of records) {
            // Find student by ID or Registration Number
            let student = null;
            try { student = await Student.findById(record.studentId || record.registrationNumber); } catch(_) {}
            if (!student) student = await Student.findOne({ registrationNumber: record.studentId || record.registrationNumber });
            if (!student) continue;

            const existing = await Attendance.findOneAndUpdate(
                { student: student._id, date: attendanceDate },
                { 
                    student: student._id, 
                    status: record.status, 
                    date: attendanceDate,
                    recordedBy: req.user.id 
                },
                { upsert: true, new: true }
            );
            results.push(existing);
        }

        res.status(200).json({ success: true, count: results.length, data: results });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get attendance stats for reports
// @route   GET /api/attendance/stats
// @access  Private (Admin, Warden)
exports.getAttendanceStats = async (req, res) => {
    try {
        const { month, year } = req.query;
        const start = new Date(year || new Date().getFullYear(), (month || new Date().getMonth() + 1) - 1, 1);
        const end = new Date(year || new Date().getFullYear(), month || new Date().getMonth() + 1, 0);

        const stats = await Attendance.aggregate([
            { $match: { date: { $gte: start, $lte: end } } },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get daily attendance list
// @route   GET /api/attendance/daily
// @access  Private (Admin, Warden)
exports.getDailyAttendance = async (req, res) => {
    try {
        const { date } = req.query;
        const searchDate = date ? new Date(date) : new Date();
        searchDate.setHours(0, 0, 0, 0);

        const records = await Attendance.find({ date: searchDate })
            .populate({
                path: 'student',
                populate: { path: 'user', select: 'name' }
            });

        res.status(200).json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Mark or update attendance for a single student
// @route   POST /api/attendance/mark
// @access  Private (Admin, Warden)
exports.markSingleAttendance = async (req, res) => {
    try {
        const { studentId, status, date } = req.body;

        if (!studentId || !status) {
            return res.status(400).json({ success: false, message: 'studentId and status are required' });
        }

        const validStatuses = ['Present', 'Absent', 'Leave'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Status must be one of: ${validStatuses.join(', ')}`
            });
        }

        const attendanceDate = date ? new Date(date) : new Date();
        attendanceDate.setHours(0, 0, 0, 0);

        // Resolve student by _id or registrationNumber
        let student = null;
        try { student = await Student.findById(studentId); } catch (_) {}
        if (!student) student = await Student.findOne({ registrationNumber: studentId });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const record = await Attendance.findOneAndUpdate(
            { student: student._id, date: attendanceDate },
            { 
                student: student._id, 
                status, 
                date: attendanceDate,
                recordedBy: req.user.id 
            },
            { upsert: true, new: true }
        );

        res.status(200).json({ success: true, message: 'Attendance marked', data: record });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get students for attendance marking (filtered for wardens)
// @route   GET /api/attendance/by-jurisdiction
// @access  Private (Admin, Warden)
exports.getStudentsByJurisdiction = async (req, res) => {
    try {
        const { date, hostel } = req.query;
        const searchDate = date ? new Date(date) : new Date();
        searchDate.setHours(0, 0, 0, 0);
        const nextDate = new Date(searchDate);
        nextDate.setDate(nextDate.getDate() + 1);

        let query = { allocationStatus: { $in: ['allocated', 'checked-in'] } };

        if (req.user.role === 'warden') {
            const { Warden } = require('../models');
            const warden = await Warden.findOne({ user: req.user._id || req.user.id });
            if (!warden || !warden.assignedHostel) {
                return res.status(200).json({ success: true, date: searchDate, data: [], message: 'Warden has no assigned hostel.' });
            }
            query.hostel = warden.assignedHostel;
        } else if (hostel && hostel !== 'All Hostels') {
            const h = await Hostel.findOne({ name: { $regex: new RegExp(`^${hostel}$`, 'i') } });
            if (h) query.hostel = h._id;
        }

        const studentsRaw = await Student.find(query)
            .populate({
                path: 'user',
                match: { isActive: true },
                select: 'name email phone isActive'
            })
            .populate('hostel', 'name')
            .populate('room', 'roomNumber');

        // Filter out students where the matching User is not found/not active
        const students = studentsRaw.filter(s => s.user !== null);

        // Fetch attendance for these students on the searchDate
        const attendanceRecords = await Attendance.find({
            date: { $gte: searchDate, $lt: nextDate },
            student: { $in: students.map(s => s._id) }
        });

        // Map attendance to students
        const data = students.map(student => {
            const record = attendanceRecords.find(r => r.student.toString() === student._id.toString());
            return {
                student,
                currentStatus: record ? record.status : 'Not Marked'
            };
        });

        res.status(200).json({ success: true, date: searchDate, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get attendance for the logged-in student
// @route   GET /api/attendance/me
// @access  Private (Student)
exports.getStudentAttendance = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user._id || req.user.id });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student profile not found' });
        }

        const stats = await Attendance.aggregate([
            { $match: { student: student._id } },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        let totalPresent = 0;
        let totalAbsent = 0;

        stats.forEach(stat => {
            if (stat._id === 'Present') totalPresent = stat.count;
            if (stat._id === 'Absent') totalAbsent = stat.count;
        });

        const totalDays = totalPresent + totalAbsent;
        const attendanceRate = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dailyRecord = await Attendance.findOne({ student: student._id, date: today });
        const dailyStatus = dailyRecord ? dailyRecord.status : 'Unknown';

        // Assuming no strict biometric logs in DB yet, falling back to recent attendance records
        const recentLogs = await Attendance.find({ student: student._id })
            .sort({ date: -1 })
            .limit(5);

        const biometricLogs = recentLogs.map((log, index) => ({
            id: log._id.toString(),
            location: 'Main Hostel Gate',
            time: new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
            type: log.status === 'Present' ? 'In' : 'Out'
        }));

        res.status(200).json({
            success: true,
            data: {
                dailyStatus,
                totalPresent,
                totalAbsent,
                attendanceRate,
                biometricLogs
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

