// Import required dependencies
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');

// Load environment variables from .env file
dotenv.config();

// Global Error Handlers (Attach early)
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection at:', new Date().toISOString());
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception at:', new Date().toISOString());
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    process.exit(1);
});

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for cross-origin requests
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Basic health check route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Hostel Management System API is running',
        timestamp: new Date().toISOString()
    });
});

// API health endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// API Routes
const authRoutes = require('./routes/authRoutes');
const testRoutes = require('./routes/testRoutes');
const studentRoutes = require('./routes/studentRoutes');
const hostelRoutes = require('./routes/hostelRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const noticeRoutes = require('./routes/announcementRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const reportsRoutes = require('./routes/reportsRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/announcements', noticeRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/reports', reportsRoutes);

// 404 handler for undefined routes
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Initialize and start server
const start = async () => {
    try {
        // 1. Connect to Database (Only Once)
        await connectDB();

        const PORT = process.env.PORT || 5001;

        // 2. Start the server with automatic port fallback
        const listenOnPort = (port) => {
            const server = app.listen(port, () => {
                console.log(`✅ Server is running on port ${port}`);
                console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
                console.log(`📍 Access at: http://localhost:${port}`);
            });

            server.on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    console.error(`❌ Port ${port} is in use. Please kill existing node processes!`);
                    process.exit(1);
                } else {
                    console.error('❌ Server startup error:', err);
                    process.exit(1);
                }
            });
        };

        listenOnPort(parseInt(PORT));

    } catch (error) {
        console.error('❌ Initialization failed:', error.message);
        process.exit(1);
    }
};

start();

module.exports = app;
