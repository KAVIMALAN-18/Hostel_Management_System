const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const normalize = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const users = await User.find({});
        console.log(`Found ${users.length} users. Starting normalization...`);

        let updatedCount = 0;
        for (const user of users) {
            const lowerEmail = user.email.toLowerCase();
            if (user.email !== lowerEmail) {
                user.email = lowerEmail;
                await user.save();
                updatedCount++;
                console.log(`Normalized: ${lowerEmail}`);
            }
        }

        console.log(`Successfully normalized ${updatedCount} emails.`);
        process.exit(0);
    } catch (err) {
        console.error('Normalization failed:', err);
        process.exit(1);
    }
};

normalize();
