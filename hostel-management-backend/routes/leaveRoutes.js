const express = require('express');
const router = express.Router();
const { applyLeave, getLeaves, updateLeave } = require('../controllers/leaveController');
const { authenticate, authorize } = require('../middleware/auth');

// Generic Protected Routes
router.use(authenticate);

// List leaves (everyone can, but filtered by role in controller)
router.get('/', getLeaves);

// Post leave (Student only)
router.post('/', authorize('student'), applyLeave);

// Update status (Admin/Warden/Student)
// Controller handles specific role-based rules for transitions
router.patch('/:id', updateLeave);

module.exports = router;
