const express = require('express');
const router = express.Router();
const { authenticate: protect, authorize } = require('../middleware/auth');
const {
    getMenu,
    updateMenu,
    getFeedbackStats,
    submitFeedback
} = require('../controllers/messController');

// All authenticated roles can view menu
router.get('/menu', protect, getMenu);

// Only administrators can edit the calendar menu
router.put('/menu/:day', protect, authorize('admin'), updateMenu);

// Only administrators can view analytical aggregates
router.get('/feedback-stats', protect, authorize('admin'), getFeedbackStats);

// Only students can submit feedback
router.post('/feedback', protect, authorize('student'), submitFeedback);

module.exports = router;
