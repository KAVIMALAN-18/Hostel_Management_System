const mongoose = require('mongoose');

/**
 * Short-lived OTP for password reset (keyed by registered phone on the user account).
 */
const passwordOtpSchema = new mongoose.Schema(
    {
        phone: { type: String, required: true, index: true },
        otpHash: { type: String, required: true },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true }
);

passwordOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('PasswordOtp', passwordOtpSchema);
