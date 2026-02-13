const express = require('express');
const router = express.Router();
const {
    createHostel,
    getHostels,
    updateHostel,
    deleteHostel,
    createRoom,
    getRooms,
    updateRoom,
    deleteRoom,
    allocateBed,
    getHostelStats
} = require('../controllers/hostelController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Hostel operations
router.post('/hostels', authorize('admin'), createHostel);
router.get('/hostels', getHostels);
router.patch('/hostels/:id', authorize('admin'), updateHostel);
router.delete('/hostels/:id', authorize('admin'), deleteHostel);
router.get('/stats', authorize('admin', 'warden'), getHostelStats);
router.patch('/allocate', authorize('admin', 'warden'), allocateBed);

// Room operations
router.post('/rooms', authorize('admin'), createRoom);
router.get('/rooms', getRooms);
router.patch('/rooms/:id', authorize('admin', 'warden'), updateRoom);
router.delete('/rooms/:id', authorize('admin'), deleteRoom);

module.exports = router;
