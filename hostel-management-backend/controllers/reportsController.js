const User = require('../models/User');
const Leave = require('../models/Leave');
const Room = require('../models/Room');
// Add other models as they are restored/needed

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/reports/stats
 * @access  Private (Admin/Warden)
 */
exports.getStats = async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
        const availableRooms = await Room.countDocuments({ isOccupied: false });
        // Mock data for others if models missing

        res.status(200).json({
            success: true,
            data: {
                totalStudents,
                pendingLeaves,
                availableRooms,
                activeComplaints: 0 // Placeholder
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
    res.status(200).json({ success: true, data: [] });
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
    res.status(200).json({ success: true, data: [] });
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
