const mongoose = require('mongoose');

/**
 * Warden Schema
 * Profile management for wardens
 */
const wardenSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },
        employeeId: {
            type: String,
            required: true,
            unique: true
        },
        assignedHostel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hostel',
            default: null
        },
        assignedFloor: {
            type: String,
            trim: true,
            default: null
        },
        department: {
            type: String,
            trim: true
        },
        qualification: {
            type: String,
            trim: true
        },
        experience: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Warden', wardenSchema);
