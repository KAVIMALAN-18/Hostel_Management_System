const express = require('express');
const router = express.Router();
const { createNotice, getNotices, updateNotice, deleteNotice } = require('../controllers/noticeController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/', authorize('admin', 'warden'), createNotice);
router.get('/', getNotices);
router.patch('/:id', authorize('admin', 'warden'), updateNotice);
router.delete('/:id', authorize('admin', 'warden'), deleteNotice);

module.exports = router;
