const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const seedAdmin = async () => {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB.');

        const adminEmail = 'admin@hostel.ac.in';
        const adminPassword = 'admin@123';

        // Delete any admin with wrong email if they somehow bypassed validation
        await User.deleteMany({ role: 'admin', email: { $ne: adminEmail } });

        let admin = await User.findOne({ email: adminEmail });

        if (admin) {
            console.log('Admin already exists. Updating password...');
            admin.password = adminPassword;
            await admin.save();
            console.log('Admin password updated.');
        } else {
            console.log('Creating new Admin...');
            admin = new User({
                name: 'System Administrator',
                email: adminEmail,
                phone: '0000000000',
                password: adminPassword,
                role: 'admin',
                isActive: true
            });
            await admin.save();
            console.log('Admin created successfully.');
        }

        console.log('---------------------------');
        console.log('Login Email:', adminEmail);
        console.log('Login Password:', adminPassword);
        console.log('---------------------------');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error.message);
        process.exit(1);
    }
};

seedAdmin();
