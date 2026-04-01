const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const {
    register,
    login,
    getMe,
    logout,
    getStaff,
    updateUser,
    deleteUser,
    sendForgotPasswordOtp,
    resetPasswordWithOtp,
} = authController;
const { authenticate, authorize } = require('../middleware/auth');
const {
    validateRegister,
    validateLogin,
    validateForgotPasswordSendOtp,
    validateForgotPasswordReset,
} = require('../middleware/requestValidators');

/**
 * Authentication Routes
 * Base path: /api/auth
 */

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public (will be admin-only in future)
router.post('/register', validateRegister, register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, login);

// @route   POST /api/auth/forgot-password/send-otp
// @route   POST /api/auth/forgot-password/reset
router.post('/forgot-password/send-otp', validateForgotPasswordSendOtp, sendForgotPasswordOtp);
router.post('/forgot-password/reset', validateForgotPasswordReset, resetPasswordWithOtp);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticate, getMe);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticate, logout);

// --- Administrative Routes ---

// @route   GET /api/auth/staff
// @desc    Get all staff (wardens)
// @access  Private/Admin
router.get('/staff', authenticate, authorize('admin'), getStaff);

// @route   PATCH /api/auth/users/:id
// @desc    Update user details
// @access  Private/Admin
router.patch('/users/:id', authenticate, authorize('admin'), updateUser);
router.put('/users/:id', authenticate, authorize('admin'), updateUser);

// @route   DELETE /api/auth/users/:id
// @desc    Remove user
// @access  Private/Admin
router.delete('/users/:id', authenticate, authorize('admin'), deleteUser);

module.exports = router;
