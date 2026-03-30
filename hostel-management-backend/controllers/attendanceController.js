const { Attendance, Student, User } = require('../models');

// @desc    Mark attendance for multiple students
// @route   POST /api/attendance/bulk
// @access  Private (Admin, Warden)
exports.markBulkAttendance = async (req, res) => {
    try {
        const { records, date } = req.body; // records: [{ registrationNumber, status }]
        
        const attendanceDate = date ? new Date(date) : new Date();
        attendanceDate.setHours(0, 0, 0, 0);

        const results = [];
        for (const record of records) {
            const student = await Student.findOne({ registrationNumber: record.registrationNumber });
            if (!student) continue;

            const existing = await Attendance.findOne({
                student: student._id,
                date: attendanceDate
            });

            if (existing) {
                existing.status = record.status;
                await existing.save();
                results.push(existing);
            } else {
                const newRecord = await Attendance.create({
                    student: student._id,
                    status: record.status,
                    date: attendanceDate
                });
                results.push(newRecord);
            }
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
            { student: student._id, status, date: attendanceDate },
            { upsert: true, new: true }
        );

        res.status(200).json({ success: true, message: 'Attendance marked', data: record });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
