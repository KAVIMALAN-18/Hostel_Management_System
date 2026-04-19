const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
    getStudents,
    getAttendanceHistory,
    getLeaveHistory
} = require('../controllers/recordsController');

// All records routes are protected and admin-only
router.use(authenticate);
router.use(authorize('admin'));

router.get('/students', getStudents);
router.get('/attendance', getAttendanceHistory);
router.get('/leave', getLeaveHistory);

module.exports = router;
