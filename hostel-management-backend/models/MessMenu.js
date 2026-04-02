const mongoose = require('mongoose');

const messMenuSchema = new mongoose.Schema(
    {
        day: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            required: true
        },
        breakfast: {
            items: [{ type: String }],
            time: { type: String, default: '08:00 AM - 09:30 AM' }
        },
        lunch: {
            items: [{ type: String }],
            time: { type: String, default: '12:30 PM - 02:00 PM' }
        },
        snacks: {
            items: [{ type: String }],
            time: { type: String, default: '04:30 PM - 05:30 PM' }
        },
        dinner: {
            items: [{ type: String }],
            time: { type: String, default: '07:30 PM - 09:00 PM' }
        },
        lastUpdatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('MessMenu', messMenuSchema);
