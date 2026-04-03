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
    deallocateBed,
    getHostelStats
} = require('../controllers/hostelController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Hostel operations
router.post('/hostels', authorize('admin'), createHostel);
router.get('/hostels', getHostels);
router.patch('/hostels/:id', authorize('admin'), updateHostel);
router.put('/hostels/:id', authorize('admin'), updateHostel);
router.delete('/hostels/:id', authorize('admin'), deleteHostel);
router.get('/stats', authorize('admin', 'warden'), getHostelStats);
router.patch('/allocate', authorize('admin', 'warden'), allocateBed);
router.put('/allocate', authorize('admin', 'warden'), allocateBed);
router.patch('/deallocate', authorize('admin', 'warden'), deallocateBed);
router.put('/deallocate', authorize('admin', 'warden'), deallocateBed);

// Room operations
router.post('/rooms', authorize('admin'), createRoom);
router.get('/rooms', getRooms);
router.patch('/rooms/:id', authorize('admin', 'warden'), updateRoom);
router.put('/rooms/:id', authorize('admin', 'warden'), updateRoom);
router.delete('/rooms/:id', authorize('admin'), deleteRoom);

module.exports = router;
