const mongoose = require('mongoose');

/**
 * Database Connection Utility
 * Connects to MongoDB using URI from environment variables
 */
const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        const obfuscatedUri = uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
        console.log(`Attempting to connect to MongoDB: ${obfuscatedUri}...`);
        
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s
        });

        console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

        return conn;
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

// Monitor connection events
mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
    console.error(`MongoDB error: ${err.message}`);
});

module.exports = connectDB;
