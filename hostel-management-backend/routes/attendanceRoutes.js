const express = require('express');
const router = express.Router();
const { authenticate: protect, authorize } = require('../middleware/auth');
const {
    markBulkAttendance,
    markSingleAttendance,
    getAttendanceStats,
    getDailyAttendance
} = require('../controllers/attendanceController');

router.use(protect);

router.post('/mark', authorize('admin', 'warden'), markSingleAttendance);
router.post('/bulk', authorize('admin', 'warden'), markBulkAttendance);
router.get('/stats', authorize('admin', 'warden'), getAttendanceStats);
router.get('/daily', authorize('admin', 'warden'), getDailyAttendance);

module.exports = router;
