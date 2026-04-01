const dotenv = require('dotenv');
const connectDB = require('./config/database');
const createApp = require('./app');

dotenv.config();
const PORT = Number(process.env.PORT) || 5001;

if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required');
}
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
}

const app = createApp();

let server;

const start = async () => {
    await connectDB();
    server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    });
};

const shutdown = (signal) => {
    console.log(`Received ${signal}. Gracefully shutting down...`);
    if (server) {
        server.close(() => process.exit(0));
    } else {
        process.exit(0);
    }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err);
    shutdown('unhandledRejection');
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    shutdown('uncaughtException');
});

start().catch((error) => {
    console.error('Initialization failed:', error.message);
    process.exit(1);
});

module.exports = { app };
