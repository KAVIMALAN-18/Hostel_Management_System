const express = require('express');
const router = express.Router();
const {
    getStats,
    getAttendanceReport,
    getLeaveReport,
    getMaintenanceReport,
    getOccupancyReport,
    getMessFeedbackReport,
    getHostelBlockStats,
    getStudentDistribution
} = require('../controllers/reportsController');
const { exportMonthlyReport } = require('../controllers/exportController');
const { authenticate, authorize } = require('../middleware/auth');

// Protect all routes - Admin and Warden only
router.use(authenticate);
router.use(authorize('admin', 'warden'));

router.get('/stats', getStats);
router.get('/attendance', getAttendanceReport);
router.get('/leave', getLeaveReport);
router.get('/maintenance', getMaintenanceReport);
router.get('/occupancy', getOccupancyReport);
router.get('/mess-feedback', getMessFeedbackReport);
router.get('/hostel-block-stats', getHostelBlockStats);
router.get('/student-distribution', getStudentDistribution);
router.get('/export', exportMonthlyReport);

module.exports = router;
