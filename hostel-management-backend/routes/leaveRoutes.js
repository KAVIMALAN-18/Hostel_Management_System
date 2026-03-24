const express = require('express');
const router = express.Router();
const { applyLeave, getLeaves, updateLeave } = require('../controllers/leaveController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateLeaveApply, validateLeaveStatusUpdate } = require('../middleware/requestValidators');

// Generic Protected Routes
router.use(authenticate);

// List leaves (everyone can, but filtered by role in controller)
router.get('/', getLeaves);

// Post leave (Student only)
router.post('/', authorize('student'), validateLeaveApply, applyLeave);

// Update status (Admin/Warden/Student)
router.patch('/:id', validateLeaveStatusUpdate, updateLeave);
router.put('/:id', validateLeaveStatusUpdate, updateLeave);

module.exports = router;
