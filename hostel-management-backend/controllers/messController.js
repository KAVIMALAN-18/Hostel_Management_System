const { MessMenu, MessFeedback } = require('../models');

// @desc    Get full mess menu
// @route   GET /api/mess/menu
// @access  Public
exports.getMenu = async (req, res) => {
    try {
        const [menu, overallStats] = await Promise.all([
            MessMenu.find().sort({ day: 1 }),
            MessFeedback.aggregate([
                {
                    $group: {
                        _id: null,
                        overallRating: { $avg: "$rating" },
                        totalFeedbacks: { $sum: 1 }
                    }
                }
            ])
        ]);

        const overall = overallStats[0] || { overallRating: 0, totalFeedbacks: 0 };
        
        res.status(200).json({ 
            success: true, 
            data: menu,
            overallRating: overall.overallRating || 0,
            totalFeedbacks: overall.totalFeedbacks || 0
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update menu for a day
// @route   PUT /api/mess/menu/:day
// @access  Private (Admin)
exports.updateMenu = async (req, res) => {
    try {
        const { day } = req.params;
        const menu = await MessMenu.findOneAndUpdate(
            { day },
            { ...req.body, lastUpdatedBy: req.user.id },
            { new: true, upsert: true, runValidators: true }
        );
        res.status(200).json({ success: true, data: menu });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Calculate mess feedback analytics
// @route   GET /api/mess/feedback-stats
// @access  Private (Admin)
exports.getFeedbackStats = async (req, res) => {
    try {
        const stats = await MessFeedback.aggregate([
            {
                $group: {
                    _id: "$day",
                    avgRating: { $avg: "$rating" },
                    totalFeedbacks: { $sum: 1 }
                }
            }
        ]);
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Submit mess feedback
// @route   POST /api/mess/feedback
// @access  Private (Student)
exports.submitFeedback = async (req, res) => {
    try {
        const { rating, comment, day } = req.body;
        
        // Ensure only student can submit
        if (req.user.role !== 'student') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const feedback = await MessFeedback.create({
            student: req.user.id,
            rating,
            comment,
            day,
            date: new Date()
        });

        res.status(201).json({ success: true, data: feedback });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
