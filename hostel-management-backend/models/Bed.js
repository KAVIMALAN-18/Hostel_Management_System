const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema(
    {
        bedNumber: {
            type: String,
            required: true
        },
        room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Room',
            required: true
        },
        status: {
            type: String,
            enum: ['available', 'occupied', 'maintenance'],
            default: 'available'
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Bed', bedSchema);
