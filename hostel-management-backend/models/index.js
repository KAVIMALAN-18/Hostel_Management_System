/**
 * Model Index File
 * Central export point for all database models
 */

const User = require('./User');
const Student = require('./Student');
const Hostel = require('./Hostel');
const Block = require('./Block');
const Room = require('./Room');
const Bed = require('./Bed');
const Complaint = require('./Complaint');
const Notice = require('./Notice');
const MessFeedback = require('./MessFeedback');
const PasswordOtp = require('./PasswordOtp');
const Attendance = require('./Attendance');
const Leave = require('./Leave');
const Warden = require('./Warden');
const MessMenu = require('./MessMenu');
const Payment = require('./Payment');
const Admin = require('./Admin');

module.exports = {
    User,
    Student,
    Hostel,
    Block,
    Room,
    Bed,
    Complaint,
    Notice,
    MessFeedback,
    PasswordOtp,
    Attendance,
    Leave,
    Warden,
    MessMenu,
    Payment,
    Admin
};
