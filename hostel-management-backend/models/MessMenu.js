const mongoose = require('mongoose');

const messMenuSchema = new mongoose.Schema(
    {
        day: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            required: true
        },
        breakfast: {
            type: String,
            required: true
        },
        lunch: {
            type: String,
            required: true
        },
        snacks: {
            type: String,
            required: true
        },
        dinner: {
            type: String,
            required: true
        },
        lastUpdatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('MessMenu', messMenuSchema);
