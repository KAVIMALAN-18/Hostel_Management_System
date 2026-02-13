const mongoose = require('mongoose');

/**
 * Student Schema
 * Extended profile for users with 'student' role
 * References the User model for authentication
 */
const studentSchema = new mongoose.Schema(
    {
        // Reference to User
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User reference is required'],
            unique: true
        },

        // Academic Information
        registrationNumber: {
            type: String,
            required: [true, 'Registration number is required'],
            unique: true,
            trim: true,
            uppercase: true
        },

        department: {
            type: String,
            required: [true, 'Department is required'],
            trim: true
        },

        course: {
            type: String,
            required: [true, 'Course is required'],
            trim: true
        },

        year: {
            type: Number,
            required: [true, 'Year is required'],
            min: [1, 'Year must be at least 1'],
            max: [5, 'Year cannot exceed 5']
        },

        semester: {
            type: Number,
            required: [true, 'Semester is required'],
            min: [1, 'Semester must be at least 1'],
            max: [10, 'Semester cannot exceed 10']
        },

        // Guardian Information
        guardianName: {
            type: String,
            required: [true, 'Guardian name is required'],
            trim: true
        },

        guardianPhone: {
            type: String,
            required: [true, 'Guardian phone is required'],
            match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
        },

        guardianRelation: {
            type: String,
            required: [true, 'Guardian relation is required'],
            trim: true
        },

        // Hostel Allocation
        hostel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hostel',
            default: null
        },

        block: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Block',
            default: null
        },

        room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Room',
            default: null
        },

        bed: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bed',
            default: null
        },

        // Admission Details
        admissionDate: {
            type: Date,
            default: Date.now
        },

        checkInDate: {
            type: Date,
            default: null
        },

        checkOutDate: {
            type: Date,
            default: null
        },

        // Status
        allocationStatus: {
            type: String,
            enum: {
                values: ['pending', 'allocated', 'checked-in', 'checked-out'],
                message: '{VALUE} is not a valid allocation status'
            },
            default: 'pending'
        },

        // Emergency Contact
        emergencyContact: {
            name: { type: String, trim: true },
            phone: {
                type: String,
                match: [/^[0-9]{10}$/, 'Invalid emergency contact phone']
            },
            relation: { type: String, trim: true }
        },

        // Medical Information
        bloodGroup: {
            type: String,
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
            required: false
        },

        medicalConditions: {
            type: String,
            trim: true,
            default: null
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Indexes for faster queries
studentSchema.index({ hostel: 1 });
studentSchema.index({ allocationStatus: 1 });

// Virtual to check if student is currently allocated
studentSchema.virtual('isAllocated').get(function () {
    return this.allocationStatus === 'allocated' || this.allocationStatus === 'checked-in';
});

module.exports = mongoose.model('Student', studentSchema);
