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
            serverSelectionTimeoutMS: 5000, 
            family: 4,                      
            autoSelectFamily: false,        
            tls: true,
            authSource: 'admin',            // Often required for Atlas
            retryWrites: true
        });

        console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

        return conn;
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        if (error.message.includes('SSL')) {
            console.error('DIAGNOSTIC: This SSL error often means your IP address is not whitelisted in MongoDB Atlas or your network is blocking the TLS handshake.');
        }
        process.exit(1);
    }
};

// Monitor connection events
mongoose.connection.on('connected', () => console.log('Mongoose connected to DB'));
mongoose.connection.on('error', (err) => console.error(`Mongoose connection error: ${err.message}`));
mongoose.connection.on('disconnected', () => console.warn('Mongoose disconnected'));

module.exports = connectDB;
