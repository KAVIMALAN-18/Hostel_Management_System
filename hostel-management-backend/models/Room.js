const mongoose = require('mongoose');

/**
 * Room Schema
 * Represents individual rooms within a block
 */
const roomSchema = new mongoose.Schema(
    {
        // Basic Information
        roomNumber: {
            type: String,
            required: [true, 'Room number is required'],
            trim: true,
            uppercase: true
        },

        // References
        hostel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hostel',
            required: [true, 'Hostel reference is required']
        },

        block: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Block',
            required: [true, 'Block reference is required']
        },

        // Room Details
        roomType: {
            type: String,
            enum: {
                values: ['single', 'double', 'triple', 'quad', 'dormitory'],
                message: '{VALUE} is not a valid room type'
            },
            required: [true, 'Room type is required']
        },

        totalBeds: {
            type: Number,
            required: [true, 'Total beds is required'],
            min: [1, 'Room must have at least 1 bed'],
            max: [10, 'Room cannot have more than 10 beds']
        },

        occupiedBeds: {
            type: Number,
            default: 0,
            min: [0, 'Occupied beds cannot be negative']
        },

        // Dimensions
        area: {
            type: Number, // in square feet
            min: [0, 'Area cannot be negative']
        },

        // Facilities
        facilities: [{
            type: String,
            trim: true
        }],

        // Amenities
        hasAttachedBathroom: {
            type: Boolean,
            default: false
        },

        hasBalcony: {
            type: Boolean,
            default: false
        },

        hasAC: {
            type: Boolean,
            default: false
        },

        hasFan: {
            type: Boolean,
            default: true
        },

        hasWindow: {
            type: Boolean,
            default: true
        },

        // Furniture
        furniture: [{
            type: String,
            trim: true
        }],

        // Status
        isActive: {
            type: Boolean,
            default: true
        },

        maintenanceStatus: {
            type: String,
            enum: {
                values: ['good', 'needs-repair', 'under-maintenance', 'out-of-service'],
                message: '{VALUE} is not a valid maintenance status'
            },
            default: 'good'
        },

        // Pricing
        rentPerBed: {
            type: Number,
            default: 0,
            min: [0, 'Rent cannot be negative']
        },

        // Description
        description: {
            type: String,
            trim: true,
            maxlength: [300, 'Description cannot exceed 300 characters']
        },

        // Images
        images: [{
            type: String
        }]
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Compound index for unique room per block
roomSchema.index({ block: 1, roomNumber: 1 }, { unique: true });
roomSchema.index({ hostel: 1 });
roomSchema.index({ block: 1 });
roomSchema.index({ roomType: 1 });
roomSchema.index({ isActive: 1 });

// Virtual for available beds
roomSchema.virtual('availableBeds').get(function () {
    return this.totalBeds - this.occupiedBeds;
});

// Virtual for occupancy percentage
roomSchema.virtual('occupancyRate').get(function () {
    if (this.totalBeds === 0) return 0;
    return ((this.occupiedBeds / this.totalBeds) * 100).toFixed(2);
});

// Virtual to check if room is full
roomSchema.virtual('isFull').get(function () {
    return this.occupiedBeds >= this.totalBeds;
});

// Virtual to check if room is available
roomSchema.virtual('isAvailable').get(function () {
    return this.isActive &&
        this.maintenanceStatus === 'good' &&
        this.occupiedBeds < this.totalBeds;
});

// Virtual populate for beds
roomSchema.virtual('beds', {
    ref: 'Bed',
    localField: '_id',
    foreignField: 'room'
});

module.exports = mongoose.model('Room', roomSchema);
