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
        mealType: {
            type: String,
            enum: ['Breakfast', 'Lunch', 'Snacks', 'Dinner'],
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('MessFeedback', messFeedbackSchema);
