const jwt = require('jsonwebtoken');

/**
 * JWT Utility Functions
 * Handles token generation and verification
 */

/**
 * Generate JWT token for authenticated user
 * @param {Object} payload - User data to encode in token
 * @param {String} payload.id - User ID
 * @param {String} payload.email - User email
 * @param {String} payload.role - User role
 * @returns {String} JWT token
 */
const generateToken = (payload) => {
    try {
        const token = jwt.sign(
            {
                id: payload.id,
                email: payload.email,
                role: payload.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRE || '7d',
                issuer: 'hostel-management-system'
            }
        );

        return token;
    } catch (error) {
        throw new Error('Token generation failed');
    }
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token has expired');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid token');
        } else {
            throw new Error('Token verification failed');
        }
    }
};

/**
 * Extract token from Authorization header
 * @param {String} authHeader - Authorization header value
 * @returns {String|null} Token or null
 */
const extractToken = (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    return authHeader.substring(7); // Remove 'Bearer ' prefix
};

module.exports = {
    generateToken,
    verifyToken,
    extractToken
};
