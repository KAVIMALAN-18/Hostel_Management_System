const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        title: {
            type: String,
            required: [true, 'Complaint title is required'],
            trim: true
        },
        description: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true,
            enum: ['Electrical', 'Plumbing', 'Furniture', 'Cleaning', 'Other']
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Critical'],
            default: 'Medium'
        },
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Resolved', 'Closed'],
            default: 'Pending'
        },
        hostelName: String,
        floor: String,
        roomNumber: String,
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        resolutionNotes: String,
        staffNotes: String
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Complaint', complaintSchema);
