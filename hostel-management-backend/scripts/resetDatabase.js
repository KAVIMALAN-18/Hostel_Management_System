const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const resetDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for database reset...');

        const collections = await mongoose.connection.db.collections();
        for (let collection of collections) {
            await collection.drop();
            console.log(`Dropped collection: ${collection.collectionName}`);
        }

        console.log('Database wiped completely.');
        process.exit(0);
    } catch (error) {
        console.error('Error resetting database:', error.message);
        process.exit(1);
    }
};

resetDatabase();
