const Leave = require('../models/Leave');
const User = require('../models/User');

/**
 * @desc    Apply for leave
 * @route   POST /api/leave
 * @access  Private (Student)
 */
exports.applyLeave = async (req, res) => {
    try {
        const { fromDate, toDate, reason, leaveType } = req.body;

        // Calculate days
        const start = new Date(fromDate);
        const end = new Date(toDate);
        const diffTime = Math.abs(end - start);
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        const leave = await Leave.create({
            student: req.user.id,
            studentName: req.user.name,
            hostelName: req.user.assignedHostel || 'Not Assigned',
            floor: req.user.assignedFloor || 'N/A',
            fromDate,
            toDate,
            days,
            reason,
            leaveType
        });

        res.status(201).json({
            success: true,
            data: leave
        });
    } catch (error) {
        console.error('Apply Leave Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error applying for leave'
        });
    }
};

/**
 * @desc    Get all leaves
 * @route   GET /api/leave
 * @access  Private
 */
exports.getLeaves = async (req, res) => {
    try {
        let query;

        // Filter based on role
        if (req.user.role === 'student') {
            query = Leave.find({ student: req.user.id });
        } else if (req.user.role === 'warden') {
            query = Leave.find({ hostelName: req.user.assignedHostel });
        } else {
            query = Leave.find();
        }

        const leaves = await query.sort('-createdAt');

        res.status(200).json({
            success: true,
            count: leaves.length,
            data: leaves
        });
    } catch (error) {
        console.error('Get Leaves Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching leave requests'
        });
    }
};

/**
 * @desc    Update leave status
 * @route   PATCH /api/leave/:id
 * @access  Private
 */
exports.updateLeave = async (req, res) => {
    try {
        const { status } = req.body;
        let leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found'
            });
        }

        // Only Admin/Warden can Approve/Reject
        if (['Approved', 'Rejected'].includes(status) && !['admin', 'warden'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to approve/reject leave'
            });
        }

        // Student can only cancel their own pending leave
        if (status === 'Cancelled') {
            if (leave.student.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to cancel this leave'
                });
            }
            if (leave.status !== 'Pending') {
                return res.status(400).json({
                    success: false,
                    message: 'Can only cancel pending leave'
                });
            }
        }

        leave.status = status;
        leave.actionBy = req.user.id;
        leave.actionDate = Date.now();

        await leave.save();

        res.status(200).json({
            success: true,
            data: leave
        });
    } catch (error) {
        console.error('Update Leave Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error updating leave status'
        });
    }
};
