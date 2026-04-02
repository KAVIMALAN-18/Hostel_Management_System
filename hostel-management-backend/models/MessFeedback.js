const mongoose = require('mongoose');

const messFeedbackSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            required: [true, 'Rating is required'],
            min: 1,
            max: 10
        },
        comment: {
            type: String,
            trim: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        day: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('MessFeedback', messFeedbackSchema);
