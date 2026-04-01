const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

/**
 * Test Routes for Role-Based Authorization
 * Base path: /api/test
 */

// @route   GET /api/test/profile
// @desc    Test access for any logged-in user
// @access  Private
router.get('/profile', authenticate, (req, res) => {
    res.status(200).json({
        success: true,
        message: `Welcome ${req.user.name}! Your role is ${req.user.role}.`,
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role
        }
    });
});

// @route   GET /api/test/admin
// @desc    Test Admin-only access
// @access  Private (Admin only)
router.get('/admin', authenticate, authorize('admin'), (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Access granted: Admin Dashboard Area'
    });
});

// @route   GET /api/test/warden
// @desc    Test Warden-only access
// @access  Private (Warden only)
router.get('/warden', authenticate, authorize('warden'), (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Access granted: Warden Panel Area'
    });
});

// @route   GET /api/test/student
// @desc    Test Student-only access
// @access  Private (Student only)
router.get('/student', authenticate, authorize('student'), (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Access granted: Student Portal Area'
    });
});

// @route   GET /api/test/staff
// @desc    Test access for multiple roles (Admin and Warden)
// @access  Private (Admin or Warden)
router.get('/staff', authenticate, authorize('admin', 'warden'), (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Access granted: Management Area (Admin/Warden)'
    });
});

module.exports = router;
