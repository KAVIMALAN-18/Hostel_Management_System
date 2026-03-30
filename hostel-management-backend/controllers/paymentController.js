const Payment = require('../models/Payment');

exports.getPayments = async (req, res) => {
    try {
        const query = {};
        // If student, only show their own payments
        if (req.user && req.user.role === 'student' && req.user.studentId) {
            query.student = req.user.studentId;
        }

        const payments = await Payment.find(query).sort({ date: -1 });

        res.status(200).json({
            success: true,
            data: payments
        });
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error: Could not fetch payments'
        });
    }
};

exports.createPayment = async (req, res) => {
    try {
        const { unit, amount, status } = req.body;
        
        let studentId;
        if (req.user.role === 'student') {
            studentId = req.user.studentId;
        } else {
            studentId = req.body.studentId;
        }

        if (!studentId) {
            return res.status(400).json({ success: false, message: 'Student ID is required for a payment' });
        }

        const transactionId = `PAY-${Math.floor(1000 + Math.random() * 9000)}`;

        const newPayment = await Payment.create({
            student: studentId,
            transactionId,
            unit,
            amount,
            status: status || 'Pending',
            date: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Payment created successfully',
            data: newPayment
        });
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error: Could not create payment'
        });
    }
};
