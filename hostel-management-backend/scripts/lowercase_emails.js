const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const lowercaseEmails = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for lowercase email migration...');

        const users = await User.find({});
        let updatedCount = 0;

        for (const user of users) {
            if (user.email && user.email !== user.email.toLowerCase()) {
                console.log(`Updating ${user.email} -> ${user.email.toLowerCase()}`);
                
                // Mongoose updateOne to avoid pre-save hooks if they interfere, but since we just change email,
                // findByIdAndUpdate is cleaner and respects Mongoose schema rules.
                await User.findByIdAndUpdate(user._id, { email: user.email.toLowerCase() }, { runValidators: false });
                updatedCount++;
            }
        }

        console.log(`Migration completed successfully. Updated ${updatedCount} users.`);
        process.exit(0);
    } catch (error) {
        console.error('Error during email migration:', error.message);
        process.exit(1);
    }
};

lowercaseEmails();
