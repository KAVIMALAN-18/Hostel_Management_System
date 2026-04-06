const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const testRoutes = require('./routes/testRoutes');
const studentRoutes = require('./routes/studentRoutes');
const hostelRoutes = require('./routes/hostelRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const noticeRoutes = require('./routes/announcementRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const messRoutes = require('./routes/messRoutes');
const wardenRoutes = require('./routes/wardenRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

function createApp() {
    const app = express();
    const isProd = process.env.NODE_ENV === 'production';
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

    app.set('trust proxy', isProd ? 1 : 0);

    const allowedOrigins = [
        FRONTEND_URL,
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5174'
    ];

    // PLACED AT THE ABSOLUTE TOP TO ENSURE PREFLIGHT SUCCESS
    app.use((req, res, next) => {
        const origin = req.header('origin');
        if (allowedOrigins.includes(origin) || !origin || !isProd || origin.includes('localhost') || origin.includes('127.0.0.1')) {
            res.header('Access-Control-Allow-Origin', origin || '*');
        }
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        res.header('Access-Control-Allow-Credentials', 'true');
        
        // Handle Preflight
        if (req.method === 'OPTIONS') {
            return res.status(200).send();
        }
        next();
    });

    app.use(
        helmet({
            crossOriginResourcePolicy: { policy: 'cross-origin' },
        })
    );
    app.use(compression());
    app.use(morgan(isProd ? 'combined' : 'dev'));
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));

    const globalRateLimit = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: isProd ? 300 : 5000,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            success: false,
            message: 'Too many requests. Please retry after some time.',
        },
    });
    app.use('/api', globalRateLimit);

    app.get('/', (_req, res) => {
        res.status(200).json({
            success: true,
            message: 'Hostel Management System API is running',
            env: process.env.NODE_ENV || 'development',
            timestamp: new Date().toISOString(),
        });
    });

    app.get('/api/health', (_req, res) => {
        res.status(200).json({
            success: true,
            message: 'API is healthy',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        });
    });

    app.use('/api/auth', authRoutes);
    app.use('/api/test', testRoutes);
    app.use('/api/students', studentRoutes);
    app.use('/api/hostels', hostelRoutes);
    app.use('/api/complaints', complaintRoutes);
    app.use('/api/announcements', noticeRoutes);
    app.use('/api/leave', leaveRoutes);
    app.use('/api/reports', reportsRoutes);
    app.use('/api/attendance', attendanceRoutes);
    app.use('/api/mess', messRoutes);
    app.use('/api/wardens', wardenRoutes);
    app.use('/api/payments', paymentRoutes);

    app.use('*', (_req, res) => {
        res.status(404).json({
            success: false,
            message: 'Route not found',
        });
    });

    return app;
}

module.exports = createApp;
