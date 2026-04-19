const { User, Student, Warden, Hostel } = require('../models');
const Admin = require('../models/Admin');
const PasswordOtp = require('../models/PasswordOtp');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');

function normalizePhoneDigits(input) {
    if (input == null) return '';
    const d = String(input).replace(/\D/g, '');
    if (d.length >= 10) return d.slice(-10);
    return d;
}

function isEmailStr(s) {
    return typeof s === 'string' && /\S+@\S+\.\S+/.test(s.trim());
}

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
    try {
        const { name, password, role } = req.body;
        const email = String(req.body.email || '').trim().toLowerCase();
        const phone = normalizePhoneDigits(req.body.phone || req.body.mobile);
        // Warden-specific optional extras
        const assignedHostel = req.body.hostel || req.body.assignedHostel || undefined;
        const assignedFloor = req.body.floor || req.body.assignedFloor || undefined;
        const gender = req.body.gender || 'Male';

        if (!name || !email || !password || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, phone, and password are required',
            });
        }
        if (phone.length < 8 || phone.length > 15) {
            return res.status(400).json({
                success: false,
                message: 'Enter a valid phone number (8-15 digits)',
            });
        }

        // Check if user already exists
        let user = await User.findOne({ $or: [{ email }, { phone }] });
        if (user) {
            return res.status(400).json({
                success: false,
                message: user.email === email ? 'User already exists with this email' : 'Phone number already registered'
            });
        }

        // Enforce name-based email and password patterns
        const nameClean = name.toLowerCase().replace(/\s+/g, '');
        if (role === 'student') {
            const expectedEmail = `${nameClean}@student.ac.in`;
            const expectedPassword = `${nameClean}@123`;
            if (email !== expectedEmail) {
                return res.status(400).json({ success: false, message: `Student email MUST be ${expectedEmail}` });
            }
            if (password !== expectedPassword) {
                return res.status(400).json({ success: false, message: `Student password MUST be ${expectedPassword}` });
            }
        } else if (role === 'warden') {
            const expectedEmail = `${nameClean}@warden.ac.in`;
            const expectedPassword = `${nameClean}@123`;
            if (email !== expectedEmail) {
                return res.status(400).json({ success: false, message: `Warden email MUST be ${expectedEmail}` });
            }
            if (password !== expectedPassword) {
                return res.status(400).json({ success: false, message: `Warden password MUST be ${expectedPassword}` });
            }
        } else if (role === 'admin') {
            const expectedEmail = 'admin@hostel.ac.in';
            const expectedPassword = 'admin@123';
            if (email !== expectedEmail) {
                return res.status(400).json({ success: false, message: `Admin email MUST be ${expectedEmail}` });
            }
            if (password !== expectedPassword) {
                return res.status(400).json({ success: false, message: `Admin password MUST be ${expectedPassword}` });
            }
        }

        user = await User.create({
            name,
            email,
            phone,
            password,
            role,
            assignedHostel,
            assignedFloor,
            gender
        });

        // Create specific profile if student or warden
        if (role === 'student') {
            await Student.create({
                user: user._id,
                registrationNumber: `REG-${Date.now()}`,
                department: 'TBD',
                course: 'TBD',
                year: 1,
                semester: 1,
                guardianName: 'TBD',
                guardianPhone: '0000000000',
                guardianRelation: 'TBD'
            });
        } else if (role === 'warden') {
            await Warden.create({
                user: user._id,
                employeeId: `EMP-${Date.now()}`
            });
        } else if (role === 'admin') {
            await Admin.create({
                user: user._id,
                employeeId: `ADM-${Date.now()}`,
                department: 'General Administration',
                permissions: ['manage_users', 'manage_hostels', 'manage_finances', 'manage_notices']
            });
        }

        // Generate token
        const token = generateToken({ id: user._id, email: user.email, role: user.role });

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                assignedHostel: user.assignedHostel,
                assignedFloor: user.assignedFloor,
                gender: user.gender,
                employeeId: user.employeeId
            }
        });
    } catch (error) {
        console.error('Registration Error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating user'
        });
    }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
        const { password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required',
            });
        }

        // Check for user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken({ id: user._id, email: user.email, role: user.role });

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                assignedHostel: user.assignedHostel,
                assignedFloor: user.assignedFloor,
                gender: user.gender,
                employeeId: user.employeeId
            }
        });
    } catch (error) {
        console.error('Login Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error during login'
        });
    }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('GetMe Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching user profile'
        });
    }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error during logout'
        });
    }
};

/**
 * @desc    Get all staff (wardens)
 * @route   GET /api/auth/staff
 * @access  Private/Admin
 */
exports.getStaff = async (req, res) => {
    try {
        const staff = await User.find({ role: 'warden' }).select('-password');
        res.status(200).json({
            success: true,
            count: staff.length,
            data: staff
        });
    } catch (error) {
        console.error('GetStaff Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching staff records'
        });
    }
};

/**
 * @desc    Update user (e.g., warden assignment)
 * @route   PATCH /api/auth/users/:id
 * @access  Private/Admin
 */
exports.updateUser = async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (updateData.email) {
            updateData.email = String(updateData.email).toLowerCase();
        }

        const user = await User.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        }).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role === 'warden') {
            await Warden.findOneAndUpdate(
                { user: user._id },
                { 
                    employeeId: user.employeeId,
                    assignedHostel: req.body.assignedHostel ? (await Hostel.findOne({ name: req.body.assignedHostel }))?._id : undefined,
                    assignedFloor: user.assignedFloor
                },
                { upsert: false }
            );
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('UpdateUser Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error updating user'
        });
    }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/auth/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User removed successfully'
        });
    } catch (error) {
        console.error('DeleteUser Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error deleting user'
        });
    }
};

/**
 * @desc    Send OTP to user's registered phone (after lookup by email or phone)
 * @route   POST /api/auth/forgot-password/send-otp
 * @access  Public
 */
exports.sendForgotPasswordOtp = async (req, res) => {
    try {
        const { identifier } = req.body;
        if (!identifier || !String(identifier).trim()) {
            return res.status(400).json({
                success: false,
                message: 'Email or phone number is required',
            });
        }

        const raw = String(identifier).trim();
        let user;

        if (isEmailStr(raw)) {
            user = await User.findOne({ email: raw.toLowerCase() });
        } else {
            const phone = normalizePhoneDigits(raw);
            if (phone.length !== 10) {
                return res.status(400).json({
                    success: false,
                    message: 'Enter a valid 10-digit mobile number',
                });
            }
            user = await User.findOne({ phone });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found with that email or phone',
            });
        }

        const phone = user.phone;
        const plainOtp = String(Math.floor(100000 + Math.random() * 900000));
        const otpHash = await bcrypt.hash(plainOtp, 10);

        await PasswordOtp.deleteMany({ phone });
        await PasswordOtp.create({
            phone,
            otpHash,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        });

        const maskedPhone = `······${phone.slice(-4)}`;
        console.log(`[Password reset OTP] ${phone}: ${plainOtp}`);

        const payload = {
            success: true,
            message: 'OTP sent to your registered mobile number',
            maskedPhone,
        };
        if (process.env.NODE_ENV !== 'production') {
            payload.devOtp = plainOtp;
        }
        res.status(200).json(payload);
    } catch (error) {
        console.error('sendForgotPasswordOtp:', error.message);
        res.status(500).json({
            success: false,
            message: 'Could not send OTP. Try again later.',
        });
    }
};

/**
 * @desc    Verify OTP and set new password
 * @route   POST /api/auth/forgot-password/reset
 * @access  Public
 */
exports.resetPasswordWithOtp = async (req, res) => {
    try {
        const { identifier, otp, newPassword } = req.body;
        if (!identifier || !String(identifier).trim()) {
            return res.status(400).json({
                success: false,
                message: 'Email or phone is required',
            });
        }
        if (!otp || String(otp).trim().length < 4) {
            return res.status(400).json({
                success: false,
                message: 'Enter the OTP sent to your phone',
            });
        }
        if (!newPassword || String(newPassword).length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters',
            });
        }

        const raw = String(identifier).trim();
        let user;

        if (isEmailStr(raw)) {
            user = await User.findOne({ email: raw.toLowerCase() });
        } else {
            const phone = normalizePhoneDigits(raw);
            if (phone.length !== 10) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid phone number',
                });
            }
            user = await User.findOne({ phone });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Account not found',
            });
        }

        const record = await PasswordOtp.findOne({ phone: user.phone }).sort({ createdAt: -1 });
        if (!record || record.expiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'OTP expired or not requested. Request a new OTP.',
            });
        }

        const match = await bcrypt.compare(String(otp).trim(), record.otpHash);
        if (!match) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP',
            });
        }

        user.password = newPassword;
        await user.save();
        await PasswordOtp.deleteMany({ phone: user.phone });

        res.status(200).json({
            success: true,
            message: 'Password updated successfully. You can sign in now.',
        });
    } catch (error) {
        console.error('resetPasswordWithOtp:', error.message);
        res.status(500).json({
            success: false,
            message: 'Could not reset password',
        });
    }
};
