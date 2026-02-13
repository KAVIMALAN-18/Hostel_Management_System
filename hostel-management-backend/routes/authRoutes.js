const express = require('express');
const router = express.Router();
const path = require('path');

// Explicitly log controller resolution for debugging
const controllerPath = path.resolve(__dirname, '../controllers/authController');
console.log(`🔍 Resolving Auth Controller at: ${controllerPath}`);

let authController;
try {
    authController = require('../controllers/authController');
    console.log('✅ Auth Controller loaded successfully');
} catch (err) {
    console.error('❌ FAILED TO LOAD AUTH CONTROLLER:', err.message);
    throw err;
}

const { register, login, getMe, logout } = authController;
const { authenticate } = require('../middleware/auth');

/**
 * Authentication Routes
 * Base path: /api/auth
 */

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public (will be admin-only in future)
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticate, getMe);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticate, logout);

module.exports = router;
