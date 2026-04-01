const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        title: {
            type: String,
            required: [true, 'Notice title is required'],
            trim: true
        },
        content: {
            type: String,
            required: [true, 'Notice content is required']
        },
        priority: {
            type: String,
            enum: ['Normal', 'Important', 'Urgent'],
            default: 'Normal'
        },
        hostel: {
            type: String,
            default: 'All'
        },
        floor: {
            type: String,
            default: 'All'
        },
        expiresAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Notice', noticeSchema);
