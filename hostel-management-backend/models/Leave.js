const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Student reference is required']
        },
        studentName: {
            type: String,
            required: true
        },
        hostelName: {
            type: String,
            required: true
        },
        floor: {
            type: String,
            required: true
        },
        fromDate: {
            type: Date,
            required: [true, 'Start date is required']
        },
        toDate: {
            type: Date,
            required: [true, 'End date is required']
        },
        days: {
            type: Number,
            required: true
        },
        reason: {
            type: String,
            required: [true, 'Reason for leave is required'],
            trim: true
        },
        leaveType: {
            type: String,
            enum: ['Personal', 'Medical', 'Emergency'],
            default: 'Personal'
        },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
            default: 'Pending'
        },
        actionBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        actionDate: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

// Basic validation to ensure end date is after start date
leaveSchema.pre('save', function (next) {
    if (this.fromDate > this.toDate) {
        return next(new Error('End date must be after start date'));
    }
    next();
});

module.exports = mongoose.model('Leave', leaveSchema);
