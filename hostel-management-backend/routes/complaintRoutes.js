const express = require('express');
const router = express.Router();
const { createComplaint, getComplaints, updateComplaintStatus } = require('../controllers/complaintController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/', authorize('student'), createComplaint);
router.get('/', getComplaints);
router.patch('/:id/status', authorize('admin', 'warden'), updateComplaintStatus);

module.exports = router;
