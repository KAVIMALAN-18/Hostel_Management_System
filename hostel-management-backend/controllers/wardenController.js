const { Warden, User } = require('../models');

// @desc    Get all warden profiles with user details
// @route   GET /api/wardens
// @access  Private (Admin)
exports.getWardens = async (req, res) => {
    try {
        const wardens = await Warden.find()
            .populate('user', 'name email phone isActive');
        res.status(200).json({ success: true, count: wardens.length, data: wardens });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update warden profile
// @route   PATCH /api/wardens/:id
// @access  Private (Admin)
exports.updateWarden = async (req, res) => {
    try {
        const warden = await Warden.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('user', 'name email phone');
        
        if (!warden) {
            return res.status(404).json({ success: false, message: 'Warden profile not found' });
        }
        
        res.status(200).json({ success: true, data: warden });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get warden stats (e.g., floor assignments)
// @route   GET /api/wardens/stats
// @access  Private (Admin)
exports.getWardenStats = async (req, res) => {
    try {
        const stats = await Warden.aggregate([
            { $group: { _id: "$assignedHostel", totalWardens: { $sum: 1 } } }
        ]);
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
