const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        const adminEmail = 'admin@gmail.com';
        const newPassword = 'admin@123';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin user already exists. Updating password...');
            existingAdmin.password = newPassword;
            await existingAdmin.save();
            console.log('Admin password updated successfully!');
            process.exit(0);
        }

        const adminUser = new User({
            name: 'Admin User',
            email: adminEmail,
            phone: '1234567890',
            password: newPassword,
            role: 'admin',
            isActive: true
        });

        await adminUser.save();
        console.log('Admin user created successfully!');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${newPassword}`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin user:', error.message);
        process.exit(1);
    }
};

seedAdmin();
