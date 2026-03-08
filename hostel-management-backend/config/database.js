const mongoose = require('mongoose');

/**
 * Database Connection Utility
 * Connects to MongoDB using URI from environment variables
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            // Options are deprecated in newer mongoose versions but kept for compatibility
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });

        console.log(`🔗 Mongoose connected to MongoDB`);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database Name: ${conn.connection.name}`);

        return conn;
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        // Log more details for debugging
        if (error.reason) console.error(`Reason: ${error.reason}`);

        // Critical error, exit process
        process.exit(1);
    }
};

// Monitor connection events
mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ Mongoose disconnected');
});

mongoose.connection.on('error', (err) => {
    console.error(`❌ Mongoose error: ${err.message}`);
});

module.exports = connectDB;
