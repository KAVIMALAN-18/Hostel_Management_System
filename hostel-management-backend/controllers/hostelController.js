const { Hostel, Room, Bed, Student } = require('../models');

// --- Hostel Controllers ---

// @route   POST /api/hostels
// @desc    Create a new hostel
// @access  Private (Admin)
exports.createHostel = async (req, res) => {
    try {
        const hostel = await Hostel.create(req.body);
        res.status(201).json({ success: true, data: hostel });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   GET /api/hostels
// @desc    Get all hostels
// @access  Private
exports.getHostels = async (req, res) => {
    try {
        const hostels = await Hostel.find();
        res.status(200).json({ success: true, data: hostels });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   PATCH /api/hostels/:id
// @desc    Update a hostel
// @access  Private (Admin)
exports.updateHostel = async (req, res) => {
    try {
        const hostel = await Hostel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!hostel) return res.status(404).json({ success: false, message: 'Hostel not found' });
        res.status(200).json({ success: true, data: hostel });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   DELETE /api/hostels/:id
// @desc    Delete a hostel
// @access  Private (Admin)
exports.deleteHostel = async (req, res) => {
    try {
        const hostel = await Hostel.findByIdAndDelete(req.params.id);
        if (!hostel) return res.status(404).json({ success: false, message: 'Hostel not found' });
        res.status(200).json({ success: true, message: 'Hostel deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Room Controllers ---

// @route   POST /api/rooms
// @desc    Create a new room in a hostel
// @access  Private (Admin)
exports.createRoom = async (req, res) => {
    try {
        const room = await Room.create(req.body);
        res.status(201).json({ success: true, data: room });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   GET /api/rooms
// @desc    Get all rooms (can filter by hostel)
// @access  Private
exports.getRooms = async (req, res) => {
    try {
        const { hostelId } = req.query;
        let query = {};
        if (hostelId) query.hostel = hostelId;

        const rooms = await Room.find(query)
            .populate('hostel', 'name')
            .populate({
                path: 'beds',
                populate: { path: 'student', select: 'name' }
            });
        res.status(200).json({ success: true, data: rooms });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   PATCH /api/rooms/:id
// @desc    Update a room
// @access  Private (Admin, Warden)
exports.updateRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
        res.status(200).json({ success: true, data: room });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   DELETE /api/rooms/:id
// @desc    Delete a room
// @access  Private (Admin)
exports.deleteRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
        res.status(200).json({ success: true, message: 'Room deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Allocation / Status Controllers ---

// @route   PATCH /api/hostels/allocate
// @desc    Allocate bed to student (High-Integrity Version)
// @access  Private (Admin, Warden)
exports.allocateBed = async (req, res) => {
    try {
        const { studentId, hostelId, blockId, roomId, bedId } = req.body;

        // 1. Verify student exists and is NOT already allocated
        const studentProfile = await Student.findOne({ user: studentId });
        if (!studentProfile) return res.status(404).json({ success: false, message: 'Student profile not found' });
        
        if (studentProfile.allocationStatus === 'allocated') {
            return res.status(400).json({ success: false, message: 'Student already has an active allocation. Deallocate first.' });
        }

        // 2. Update Bed status (Atomically verify it is 'vacant')
        const bed = await Bed.findOneAndUpdate(
            { _id: bedId, status: 'vacant' },
            { status: 'occupied', student: studentId },
            { new: true }
        );
        if (!bed) return res.status(400).json({ success: false, message: 'Bed is either not found or already occupied.' });

        // 3. Update Room occupancy count
        await Room.findByIdAndUpdate(roomId, { $inc: { occupiedBeds: 1 } });

        // 4. Update Student profile with centralized reference
        studentProfile.hostel = hostelId;
        studentProfile.block = blockId;
        studentProfile.room = roomId;
        studentProfile.bed = bedId;
        studentProfile.allocationStatus = 'allocated';
        await studentProfile.save();

        res.status(200).json({
            success: true,
            message: 'Bed allocated successfully',
            data: studentProfile
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   PATCH /api/hostels/deallocate
// @desc    Release bed from student
// @access  Private (Admin, Warden)
exports.deallocateBed = async (req, res) => {
    try {
        const { studentId } = req.body;

        const studentProfile = await Student.findOne({ user: studentId });
        if (!studentProfile || studentProfile.allocationStatus === 'unallocated') {
            return res.status(400).json({ success: false, message: 'Student has no active allocation to release.' });
        }

        const { room: roomId, bed: bedId } = studentProfile;

        // 1. Mark Bed as vacant
        if (bedId) {
            await Bed.findByIdAndUpdate(bedId, { status: 'vacant', student: null });
        }

        // 2. Decrement Room occupancy
        if (roomId) {
            await Room.findByIdAndUpdate(roomId, { $inc: { occupiedBeds: -1 } });
        }

        // 3. Reset Student profile references
        studentProfile.hostel = null;
        studentProfile.block = null;
        studentProfile.room = null;
        studentProfile.bed = null;
        studentProfile.allocationStatus = 'unallocated';
        await studentProfile.save();

        res.status(200).json({
            success: true,
            message: 'Bed deallocated successfully. Occupancy updated.',
            data: studentProfile
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   GET /api/hostels/stats
// @desc    Get overall hostel statistics
// @access  Private (Admin, Warden)
exports.getHostelStats = async (req, res) => {
    try {
        const totalHostels = await Hostel.countDocuments();
        const totalRooms = await Room.countDocuments();
        const totalBeds = await Bed.countDocuments();
        const occupiedBeds = await Bed.countDocuments({ status: 'occupied' });

        res.status(200).json({
            success: true,
            data: {
                totalHostels,
                totalRooms,
                totalBeds,
                availableBeds: totalBeds - occupiedBeds,
                occupancyRate: totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(2) + '%' : '0%'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
