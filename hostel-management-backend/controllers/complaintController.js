const { Complaint, Student, User } = require('../models');

// @route   POST /api/complaints
// @desc    Submit a new maintenance ticket
// @access  Private (Student)
exports.createComplaint = async (req, res) => {
    try {
        const { title, description, category, priority } = req.body;

        // Fetch student details to auto-fill location
        const studentProfile = await Student.findOne({ user: req.user.id })
            .populate('hostel', 'name')
            .populate('room', 'roomNumber');

        const complaint = await Complaint.create({
            title,
            description,
            category,
            priority: priority || 'Medium',
            student: req.user.id,
            hostelName: studentProfile?.hostel?.name || 'N/A',
            floor: studentProfile?.room?.floor || studentProfile?.floor || 'N/A', // Assuming floor might be in student or room
            roomNumber: studentProfile?.room?.roomNumber || 'N/A'
        });

        res.status(201).json({
            success: true,
            data: complaint
        });
    } catch (error) {
        console.error('Create ticket error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   GET /api/complaints
// @desc    Get maintenance tickets (Staff see filtered, Student sees own)
// @access  Private
exports.getComplaints = async (req, res) => {
    try {
        let filter = {};
        const { hostel, priority, status } = req.query;

        // Role-based scoping
        if (req.user.role === 'student') {
            filter.student = req.user.id;
        } else if (req.user.role === 'warden') {
            const warden = await User.findById(req.user.id);
            if (warden && warden.assignedHostel) {
                filter.hostelName = warden.assignedHostel;
            }
        }

        // Additional query filters
        if (hostel && hostel !== 'All Hostels' && hostel !== 'All') filter.hostelName = hostel;
        if (priority && priority !== 'All') filter.priority = priority;
        if (status && status !== 'all' && status !== 'All') filter.status = status;

        const complaints = await Complaint.find(filter)
            .populate('student', 'name email phone')
            .populate('assignedTo', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: complaints.length,
            data: complaints
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   PATCH /api/complaints/:id/status
// @desc    Update ticket status and details
// @access  Private (Admin, Warden)
exports.updateComplaintStatus = async (req, res) => {
    try {
        const { status, priority, assignedTo, resolutionNotes, staffNotes } = req.body;
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        if (status) complaint.status = status;
        if (priority) complaint.priority = priority;
        if (assignedTo) complaint.assignedTo = assignedTo;
        if (resolutionNotes) complaint.resolutionNotes = resolutionNotes;
        if (staffNotes) complaint.staffNotes = staffNotes;

        await complaint.save();

        res.status(200).json({
            success: true,
            data: complaint
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
