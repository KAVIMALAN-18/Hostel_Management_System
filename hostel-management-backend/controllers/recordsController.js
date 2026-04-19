const { Student, Attendance, Leave } = require('../models');

// @desc    Get all students for filtering
// @route   GET /api/records/students
// @access  Private (Admin)
exports.getStudents = async (req, res) => {
    try {
        const students = await Student.find({})
            .populate({
                path: 'user',
                select: 'name email'
            })
            .select('registrationNumber user');
            
        // Filter out those without user
        const validStudents = students.filter(s => s.user).map(s => ({
            id: s._id,
            registrationNumber: s.registrationNumber,
            name: s.user.name,
            email: s.user.email
        }));

        res.status(200).json({ success: true, data: validStudents });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get attendance history
// @route   GET /api/records/attendance
// @access  Private (Admin)
exports.getAttendanceHistory = async (req, res) => {
    try {
        const { student_id, date, from, to } = req.query;
        let query = {};

        if (student_id) {
            query.student = student_id;
        }

        if (date) {
            const searchDate = new Date(date);
            searchDate.setHours(0, 0, 0, 0);
            const nextDate = new Date(searchDate);
            nextDate.setDate(nextDate.getDate() + 1);
            query.date = { $gte: searchDate, $lt: nextDate };
        } else if (from && to) {
            const startDate = new Date(from);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(to);
            endDate.setHours(23, 59, 59, 999);
            query.date = { $gte: startDate, $lte: endDate };
        }

        const records = await Attendance.find(query)
            .populate({
                path: 'student',
                populate: { path: 'user', select: 'name' }
            })
            .sort({ date: -1 });

        res.status(200).json({ success: true, count: records.length, data: records });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get leave history
// @route   GET /api/records/leave
// @access  Private (Admin)
exports.getLeaveHistory = async (req, res) => {
    try {
        const { student_id } = req.query;
        let query = {};

        if (student_id) {
            query.student = student_id;
        }

        const records = await Leave.find(query)
            .populate({
                path: 'student',
                populate: { path: 'user', select: 'name' }
            })
            .sort({ fromDate: -1 });

        res.status(200).json({ success: true, count: records.length, data: records });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
