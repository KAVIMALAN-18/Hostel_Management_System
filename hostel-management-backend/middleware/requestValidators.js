const ALLOWED_ROLES = ['admin', 'warden', 'student'];
const LEAVE_STATUSES = ['Pending', 'Approved', 'Rejected', 'Cancelled'];

const isEmail = (value) => /\S+@\S+\.\S+/.test(String(value || '').trim());
const normalizePhone = (value) => String(value || '').replace(/\D/g, '');

exports.validateRegister = (req, res, next) => {
    const { name, email, password, role } = req.body;
    const phone = normalizePhone(req.body.phone || req.body.mobile);

    if (!name || !String(name).trim()) {
        return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!isEmail(email)) {
        return res.status(400).json({ success: false, message: 'Valid email is required' });
    }
    if (phone.length !== 10) {
        return res.status(400).json({ success: false, message: 'Phone number must be 10 digits' });
    }
    if (!password || String(password).length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    if (role && !ALLOWED_ROLES.includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role selected' });
    }

    req.body.email = String(email).trim().toLowerCase();
    req.body.phone = phone;
    next();
};

exports.validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    if (!isEmail(email)) {
        return res.status(400).json({ success: false, message: 'Valid email is required' });
    }
    if (!password || String(password).length < 1) {
        return res.status(400).json({ success: false, message: 'Password is required' });
    }

    req.body.email = String(email).trim().toLowerCase();
    next();
};

exports.validateForgotPasswordSendOtp = (req, res, next) => {
    const { identifier } = req.body;
    const value = String(identifier || '').trim();
    if (!value) {
        return res.status(400).json({ success: false, message: 'Email or phone number is required' });
    }
    const phone = normalizePhone(value);
    if (!isEmail(value) && phone.length !== 10) {
        return res.status(400).json({ success: false, message: 'Provide valid email or 10-digit phone number' });
    }
    next();
};

exports.validateForgotPasswordReset = (req, res, next) => {
    const { identifier, otp, newPassword } = req.body;
    const value = String(identifier || '').trim();
    const phone = normalizePhone(value);

    if (!value) {
        return res.status(400).json({ success: false, message: 'Email or phone is required' });
    }
    if (!isEmail(value) && phone.length !== 10) {
        return res.status(400).json({ success: false, message: 'Provide valid email or 10-digit phone number' });
    }
    if (!otp || String(otp).trim().length < 4) {
        return res.status(400).json({ success: false, message: 'OTP is required' });
    }
    if (!newPassword || String(newPassword).length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    next();
};

exports.validateLeaveApply = (req, res, next) => {
    const { fromDate, toDate, reason } = req.body;
    if (!fromDate || !toDate) {
        return res.status(400).json({ success: false, message: 'From date and to date are required' });
    }
    if (!reason || !String(reason).trim()) {
        return res.status(400).json({ success: false, message: 'Reason is required' });
    }
    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid date format' });
    }
    if (end < start) {
        return res.status(400).json({ success: false, message: 'Return date must be on or after start date' });
    }
    next();
};

exports.validateLeaveStatusUpdate = (req, res, next) => {
    const { status } = req.body;
    if (!status || !LEAVE_STATUSES.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid leave status value' });
    }
    next();
};
