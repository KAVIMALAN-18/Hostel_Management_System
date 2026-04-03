const { Student, User, Hostel, Block, Room, Bed } = require('../models');

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
            .populate('hostel', 'name type')
            .populate('block', 'name')
            .populate('room', 'roomNumber roomType floor')
            .populate('bed', 'bedNumber');

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

// @route   GET /api/students/profile/me
// @desc    Get current student's enriched profile
// @access  Private (Student)
exports.getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const profile = await Student.findOne({ user: userId })
            .populate('hostel', 'name type')
            .populate('block', 'name')
            .populate('room', 'roomNumber roomType floor')
            .populate('bed', 'bedNumber');

        if (!profile) {
            return res.status(200).json({
                success: true,
                data: {
                    ...user.toObject(),
                    profile: null
                }
            });
        }

        // Fetch roommates if room is assigned
        let roommates = [];
        let warden = null;

        if (profile.room) {
            const roommateProfiles = await Student.find({
                room: profile.room._id,
                user: { $ne: userId }
            }).populate('user', 'name');
            
            roommates = roommateProfiles.map(p => p.user?.name).filter(Boolean);

            // Fetch Warden for this hostel from the Warden model
            if (profile.hostel) {
                const { Warden } = require('../models');
                const wardenProfile = await Warden.findOne({ 
                    assignedHostel: profile.hostel._id 
                }).populate('user', 'name phone email');
                
                warden = wardenProfile ? wardenProfile.user : null;
            }
        }

        res.status(200).json({
            success: true,
            data: {
                ...user.toObject(),
                profile: {
                    ...profile.toObject(),
                    roommates,
                    warden
                }
            }
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
            .populate('room', 'roomNumber roomType floor')
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
        const userUpdateParams = {};
        if (req.body.isActive !== undefined) userUpdateParams.isActive = req.body.isActive;
        if (req.body.phone !== undefined) userUpdateParams.phone = req.body.phone;
        if (req.body.name !== undefined) userUpdateParams.name = req.body.name;
        if (req.body.email !== undefined) userUpdateParams.email = req.body.email;
        
        let user;
        if (Object.keys(userUpdateParams).length > 0) {
            user = await User.findByIdAndUpdate(userId, userUpdateParams, {
                new: true,
                runValidators: true
            }).select('-password');
        } else {
            user = await User.findById(userId).select('-password');
        }

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

// @route   DELETE /api/students/:id/permanent
// @desc    Permanently delete student
// @access  Private (Admin)
exports.deletePermanent = async (req, res) => {
    try {
        const userId = req.params.id;

        // 1. Find student profile to check for bed assignment
        const profile = await Student.findOne({ user: userId });
        
        if (profile) {
            // 2. Free up the bed if assigned
            if (profile.bed) {
                await Bed.findByIdAndUpdate(profile.bed, {
                    isOccupied: false,
                    occupiedBy: null
                });
            }

            // 3. Clear historical attendance to avoid "Unknown Student" orphans
            await Attendance.deleteMany({ student: profile._id });
            
            // 4. Delete Student profile
            await Student.findByIdAndDelete(profile._id);
        }

        // 4. Delete User record
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Student and profile deleted permanently, bed freed'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
