const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Hostel name is required'],
            unique: true,
            trim: true,
            enum: {
                values: ['Sapphire', 'Ruby', 'Pearl', 'Emerald'],
                message: '{VALUE} is not a valid hostel name. Choose from Sapphire, Ruby, Pearl, or Emerald.'
            }
        },
        type: {
            type: String,
            enum: ['Boys', 'Girls'],
            required: true
        },
        capacity: {
            type: Number,
            required: true
        },
        currentOccupancy: {
            type: Number,
            default: 0
        },
        description: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Hostel', hostelSchema);
