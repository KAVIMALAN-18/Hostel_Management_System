const express = require('express');
const router = express.Router();
const { authenticate: protect, authorize } = require('../middleware/auth');
const {
    markBulkAttendance,
    markSingleAttendance,
    getAttendanceStats,
    getDailyAttendance,
    getStudentsByJurisdiction,
    getStudentAttendance,
    getStudentAttendanceHistory
} = require('../controllers/attendanceController');

router.use(protect);

router.get('/me', authorize('student'), getStudentAttendance);
router.post('/mark', authorize('admin', 'warden'), markSingleAttendance);
router.post('/bulk', authorize('admin', 'warden'), markBulkAttendance);
router.get('/stats', authorize('admin', 'warden'), getAttendanceStats);
router.get('/daily', authorize('admin', 'warden'), getDailyAttendance);
router.get('/by-jurisdiction', authorize('admin', 'warden'), getStudentsByJurisdiction);
router.get('/student/:id', authorize('admin', 'warden'), getStudentAttendanceHistory);

module.exports = router;
