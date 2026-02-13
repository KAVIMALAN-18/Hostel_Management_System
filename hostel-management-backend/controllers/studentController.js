const { Student, User } = require('../models');

// @route   GET /api/students
// @desc    Get all students with profiles
// @access  Private (Admin, Warden)
exports.getStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' })
            .select('-password')
            .sort({ createdAt: -1 });

        // Fetch all student profiles related to these users
        const profiles = await Student.find({ user: { $in: students.map(s => s._id) } })
            .populate('hostel', 'name')
            .populate('room', 'roomNumber');

        // Combine user and profile data
        const combinedData = students.map(user => {
            const profile = profiles.find(p => p.user.toString() === user._id.toString());
            return {
                ...user.toObject(),
                profile: profile || null
            };
        });

        res.status(200).json({
            success: true,
            count: students.length,
            data: combinedData
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   GET /api/students/:id
// @desc    Get single student detail profile
// @access  Private (Admin, Warden, or Self)
exports.getStudentProfile = async (req, res) => {
    try {
        const userId = req.params.id;

        // If student, check if accessing own profile
        if (req.user.role === 'student' && req.user.id !== userId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const profile = await Student.findOne({ user: userId })
            .populate('hostel', 'name type')
            .populate('block', 'name')
            .populate('room', 'roomNumber roomType')
            .populate('bed', 'bedNumber');

        res.status(200).json({
            success: true,
            data: {
                ...user.toObject(),
                profile: profile || null
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   PATCH /api/students/:id
// @desc    Update student profile
// @access  Private (Admin, Warden, or Self)
exports.updateStudent = async (req, res) => {
    try {
        const userId = req.params.id;

        // If student, check if accessing own profile
        if (req.user.role === 'student' && req.user.id !== userId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Separate user and profile updates
        const { password, role, ...profileData } = req.body;

        // Update User model
        const user = await User.findByIdAndUpdate(userId, { isActive: req.body.isActive }, {
            new: true,
            runValidators: true
        }).select('-password');

        // Update Student model
        const profile = await Student.findOneAndUpdate(
            { user: userId },
            profileData,
            { new: true, runValidators: true, upsert: true }
        );

        res.status(200).json({
            success: true,
            data: {
                ...user.toObject(),
                profile
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   DELETE /api/students/:id
// @desc    Deactivate student
// @access  Private (Admin)
exports.deactivateStudent = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Student deactivated successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
