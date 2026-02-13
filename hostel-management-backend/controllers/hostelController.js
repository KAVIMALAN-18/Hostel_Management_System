const { Hostel, Room, Bed } = require('../models');

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

        const rooms = await Room.find(query).populate('hostel', 'name');
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
// @desc    Allocate bed to student
// @access  Private (Admin, Warden)
exports.allocateBed = async (req, res) => {
    try {
        const { studentId, hostelId, blockId, roomId, bedId } = req.body;

        // Verify student exists
        const studentProfile = await Student.findOne({ user: studentId });
        if (!studentProfile) return res.status(404).json({ success: false, message: 'Student profile not found' });

        // Update Bed status
        const bed = await Bed.findByIdAndUpdate(bedId, { status: 'occupied', student: studentId }, { new: true });
        if (!bed) return res.status(404).json({ success: false, message: 'Bed not found' });

        // Update Room occupancy
        await Room.findByIdAndUpdate(roomId, { $inc: { occupiedBeds: 1 } });

        // Update Student profile
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
