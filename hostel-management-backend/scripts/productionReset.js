const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { 
    User, Student, Warden, Admin, Hostel, Room, Bed, 
    Complaint, Notice, MessFeedback, MessMenu, 
    Attendance, Leave, Payment, Block, PasswordOtp
} = require('../models');

dotenv.config();

const productionReset = async () => {
    try {
        console.log('--- PRODUCTION DATABASE RESET INITIATED ---');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB Atlas.');

        const collections = [
            User, Student, Warden, Admin, Hostel, Room, Bed, 
            Complaint, Notice, MessFeedback, MessMenu, 
            Attendance, Leave, Payment, Block, PasswordOtp
        ];

        console.log('Purging all existing data...');
        for (const model of collections) {
            const count = await model.countDocuments();
            await model.deleteMany({});
            console.log(`Cleared ${model.modelName} collection (${count} records removed).`);
        }

        console.log('Seeding Production Super Admin...');
        const adminEmail = 'admin@hostel.ac.in';
        const adminPassword = 'admin@123';

        const adminUser = new User({
            name: 'Super Admin',
            email: adminEmail,
            phone: '0000000000',
            password: adminPassword,
            role: 'admin',
            isActive: true
        });

        await adminUser.save();
        console.log('Production Super Admin created successfully!');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);

        console.log('--- RESET COMPLETE ---');
        process.exit(0);
    } catch (error) {
        console.error('CRITICAL ERROR DURING RESET:', error.message);
        process.exit(1);
    }
};

productionReset();
