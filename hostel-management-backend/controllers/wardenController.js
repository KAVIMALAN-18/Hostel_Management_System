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

// @desc    Update warden profile and user details
// @route   PUT /api/wardens/:id
// @access  Private (Admin)
exports.updateWarden = async (req, res) => {
    try {
        const { name, email, phone, assignedHostel, assignedFloor, employeeId, gender } = req.body;
        
        // 1. Find Warden Profile
        const warden = await Warden.findById(req.params.id);
        if (!warden) {
            return res.status(404).json({ success: false, message: 'Warden profile not found' });
        }

        // 2. Update User Document
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email.toLowerCase();
        if (phone) updateData.phone = phone;
        if (employeeId) updateData.employeeId = employeeId;
        if (gender) updateData.gender = gender;
        if (assignedHostel) updateData.assignedHostel = assignedHostel; // Update string in User
        if (assignedFloor) updateData.assignedFloor = assignedFloor;   // Update string in User

        await User.findByIdAndUpdate(warden.user, updateData, { runValidators: true });

        // 3. Update Warden Document
        const wardenUpdate = {};
        if (assignedFloor) wardenUpdate.assignedFloor = assignedFloor;
        if (employeeId) wardenUpdate.employeeId = employeeId;
        
        // Resolve Hostel ID if name provided
        if (assignedHostel && typeof assignedHostel === 'string' && assignedHostel.length !== 24) {
            const { Hostel } = require('../models');
            const hostel = await Hostel.findOne({ name: new RegExp('^' + assignedHostel.trim() + '$', 'i') });
            if (hostel) wardenUpdate.assignedHostel = hostel._id;
        } else if (assignedHostel) {
            wardenUpdate.assignedHostel = assignedHostel;
        }

        const updatedWarden = await Warden.findByIdAndUpdate(req.params.id, wardenUpdate, { new: true })
            .populate('user', 'name email phone');

        res.status(200).json({ success: true, data: updatedWarden });
    } catch (error) {
        console.error('[API ERROR] updateWarden:', error.message);
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
