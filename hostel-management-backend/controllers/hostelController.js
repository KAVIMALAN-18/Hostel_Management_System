const { Hostel, Room, Bed, Student } = require('../models');

// --- Hostel Controllers ---

// @route   POST /api/hostels
// @desc    Create a new hostel
// @access  Private (Admin)
exports.createHostel = async (req, res, next) => {
    console.log('--- ENTERED createHostel ---');
    try {
        const { 
            name, type, capacity, description, 
            startRoomNo, endRoomNo, 
            singleCotCount = 0, doubleCotCount = 0, fourCotCount = 0,
            defaultFloor = 'Ground Floor'
        } = req.body;

        const hostel = await Hostel.create({ name, type, capacity, description });

        // Bulk Room Creation if requested
        if (startRoomNo && endRoomNo) {
            const start = parseInt(startRoomNo);
            const end = parseInt(endRoomNo);
            
            if (!isNaN(start) && !isNaN(end) && start <= end) {
                let currentRoomNo = start;
                
                // Create Single Cot Rooms
                for (let i = 0; i < parseInt(singleCotCount); i++) {
                    if (currentRoomNo > end) break;
                    await _createRoomInternal({
                        roomNumber: `${currentRoomNo}`,
                        roomType: 'single cart',
                        floor: defaultFloor,
                        hostel: hostel._id
                    });
                    currentRoomNo++;
                }

                // Create Double Cot Rooms
                for (let i = 0; i < parseInt(doubleCotCount); i++) {
                    if (currentRoomNo > end) break;
                    await _createRoomInternal({
                        roomNumber: `${currentRoomNo}`,
                        roomType: '2 cart',
                        floor: defaultFloor,
                        hostel: hostel._id
                    });
                    currentRoomNo++;
                }

                // Create Four Cot Rooms
                for (let i = 0; i < parseInt(fourCotCount); i++) {
                    if (currentRoomNo > end) break;
                    await _createRoomInternal({
                        roomNumber: `${currentRoomNo}`,
                        roomType: 'four cart',
                        floor: defaultFloor,
                        hostel: hostel._id
                    });
                    currentRoomNo++;
                }
            }
        }

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

// Internal helper for room & bed creation logic
const _createRoomInternal = async (roomPayload, students = []) => {
    // Auto-calculate totalBeds for cart types if not provided
    if (roomPayload.roomType === 'single cart') roomPayload.totalBeds = 1;
    else if (roomPayload.roomType === '2 cart') roomPayload.totalBeds = 2;
    else if (roomPayload.roomType === 'four cart') roomPayload.totalBeds = 4;

    const room = await Room.create(roomPayload);

    // Auto-generate underlying bed allocations based on the room size (totalBeds)
    if (room.totalBeds > 0) {
        const newBeds = [];
        
        for (let i = 1; i <= room.totalBeds; i++) {
            const assignedStudentId = (students && students[i - 1]) ? students[i - 1] : null;
            
            newBeds.push({
                bedNumber: `${room.roomNumber}-${String.fromCharCode(64 + i)}`,
                room: room._id,
                status: assignedStudentId ? 'occupied' : 'available',
                student: assignedStudentId
            });
        }
        const createdBeds = await Bed.insertMany(newBeds);

        // Update student profiles if any were assigned
        if (students && students.length > 0) {
            for (let i = 0; i < Math.min(students.length, room.totalBeds); i++) {
                const studentId = students[i];
                const bedId = createdBeds[i]._id;
                await Student.findOneAndUpdate(
                    { user: studentId },
                    {
                        hostel: room.hostel,
                        room: room._id,
                        bed: bedId,
                        allocationStatus: 'allocated'
                    }
                );
            }
        }
        
        // Update room occupancy
        if (students && students.length > 0) {
            room.occupiedBeds = Math.min(students.length, room.totalBeds);
            await room.save();
        }
    }
    return room;
};

// @route   POST /api/rooms
// @desc    Create a new room in a hostel
// @access  Private (Admin)
exports.createRoom = async (req, res) => {
    try {
        const { students, ...roomPayload } = req.body;
        const room = await _createRoomInternal(roomPayload, students);
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
// @desc    Update a room (handles bed synchronization for cart-based capacity changes)
// @access  Private (Admin, Warden)
exports.updateRoom = async (req, res) => {
    try {
        const roomId = req.params.id;
        const updateData = req.body;

        // 1. Auto-calculate totalBeds for cart types if roomType is updated
        if (updateData.roomType === 'single cart') updateData.totalBeds = 1;
        else if (updateData.roomType === '2 cart') updateData.totalBeds = 2;
        else if (updateData.roomType === 'four cart') updateData.totalBeds = 4;

        const oldRoom = await Room.findById(roomId);
        if (!oldRoom) return res.status(404).json({ success: false, message: 'Room not found' });

        const room = await Room.findByIdAndUpdate(roomId, updateData, { new: true, runValidators: true });

        // 2. Sync Beds if totalBeds changed
        if (updateData.totalBeds && updateData.totalBeds !== oldRoom.totalBeds) {
            const currentBeds = await Bed.find({ room: roomId }).sort({ bedNumber: 1 });
            
            if (updateData.totalBeds > oldRoom.totalBeds) {
                // Add new beds
                const newBedsCount = updateData.totalBeds - oldRoom.totalBeds;
                const newBeds = [];
                for (let i = 1; i <= newBedsCount; i++) {
                    const bedIndex = oldRoom.totalBeds + i;
                    newBeds.push({
                        bedNumber: `${room.roomNumber}-${String.fromCharCode(64 + bedIndex)}`,
                        room: roomId,
                        status: 'available'
                    });
                }
                await Bed.insertMany(newBeds);
            } else {
                // Remove excess beds (Caution: only if they are available)
                const excessBeds = currentBeds.slice(updateData.totalBeds);
                const occupiedBeds = excessBeds.filter(b => b.status === 'occupied');
                
                if (occupiedBeds.length > 0) {
                    // Revert capacity change if occupied beds are in the range to be removed
                    await Room.findByIdAndUpdate(roomId, { totalBeds: oldRoom.totalBeds, roomType: oldRoom.roomType });
                    return res.status(400).json({ 
                        success: false, 
                        message: `Cannot reduce capacity. ${occupiedBeds.length} beds in the removal range are currently occupied.` 
                    });
                }
                
                const excessBedIds = excessBeds.map(b => b._id);
                await Bed.deleteMany({ _id: { $in: excessBedIds } });
            }
        }

        res.status(200).json({ success: true, data: room });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   DELETE /api/rooms/:id
// @desc    Delete a room (with student deallocation and bed cleanup)
// @access  Private (Admin)
exports.deleteRoom = async (req, res) => {
    try {
        const roomId = req.params.id;

        // 1. Find and Unassign all students currently in this room
        await Student.updateMany(
            { room: roomId },
            { 
                hostel: null, 
                block: null, 
                room: null, 
                bed: null, 
                allocationStatus: 'pending' 
            }
        );

        // 2. Delete all Bed records for this room
        await Bed.deleteMany({ room: roomId });

        // 3. Delete the Room itself
        const room = await Room.findByIdAndDelete(roomId);
        
        if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
        
        res.status(200).json({ success: true, message: 'Room deleted successfully, students unassigned, and beds removed.' });
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

        // 2. Update Bed status (Atomically verify it is 'available')
        const bed = await Bed.findOneAndUpdate(
            { _id: bedId, status: 'available' },
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
        if (!studentProfile || studentProfile.allocationStatus === 'pending') {
            return res.status(400).json({ success: false, message: 'Student has no active allocation to release.' });
        }

        const { room: roomId, bed: bedId } = studentProfile;

        // 1. Mark Bed as available
        if (bedId) {
            await Bed.findByIdAndUpdate(bedId, { status: 'available', student: null });
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
        studentProfile.allocationStatus = 'pending';
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
