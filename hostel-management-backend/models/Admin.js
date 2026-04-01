const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    employeeId: {
        type: String,
        unique: true,
        sparse: true
    },
    department: {
        type: String,
        trim: true,
        default: 'General Administration'
    },
    permissions: [{
        type: String,
        enum: ['manage_users', 'manage_hostels', 'manage_finances', 'manage_notices', 'super_admin']
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Admin', adminSchema);
