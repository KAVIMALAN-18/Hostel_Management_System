const { Notice, User } = require('../models');

// @route   POST /api/notices
// @desc    Create a new notice
// @access  Private (Admin, Warden)
exports.createNotice = async (req, res) => {
    try {
        const { title, content, priority, hostel, floor, expiresAt } = req.body;

        // Warden restriction: Can only post to their assigned hostel
        if (req.user.role === 'warden') {
            const warden = await User.findById(req.user.id);
            if (hostel !== 'All' && hostel !== warden.assignedHostel) {
                return res.status(403).json({
                    success: false,
                    message: `You can only post announcements for ${warden.assignedHostel || 'your assigned hostel'}`
                });
            }
        }

        const notice = await Notice.create({
            title,
            content,
            priority,
            hostel: hostel || 'All',
            floor: floor || 'All',
            expiresAt,
            author: req.user.id
        });

        res.status(201).json({
            success: true,
            data: notice
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   GET /api/notices
// @desc    Get all active notices
// @access  Private
exports.getNotices = async (req, res) => {
    try {
        const { hostel, floor, priority, status } = req.query;
        let query = {};

        // Filtering logic
        if (hostel && hostel !== 'All') query.hostel = hostel;
        if (floor && floor !== 'All') query.floor = floor;
        if (priority && priority !== 'All') query.priority = priority;

        // Auto-hide expired notices unless requested specifically
        if (status === 'Active') {
            query.$or = [
                { expiresAt: null },
                { expiresAt: { $gt: new Date() } }
            ];
        }

        const notices = await Notice.find(query)
            .populate('author', 'name role')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: notices.length,
            data: notices
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   PATCH /api/notices/:id
// @desc    Update a notice
// @access  Private (Admin, Warden)
exports.updateNotice = async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);

        if (!notice) {
            return res.status(404).json({ success: false, message: 'Notice not found' });
        }

        // Ownership check for Warden
        if (req.user.role === 'warden' && notice.author.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'You can only edit your own announcements' });
        }

        const updatedNotice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        res.status(200).json({
            success: true,
            data: updatedNotice
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   DELETE /api/notices/:id
// @desc    Delete a notice
// @access  Private (Admin, Warden)
exports.deleteNotice = async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);

        if (!notice) {
            return res.status(404).json({ success: false, message: 'Notice not found' });
        }

        // Ownership check for Warden
        if (req.user.role === 'warden' && notice.author.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'You can only delete your own announcements' });
        }

        await notice.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Notice removed'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
