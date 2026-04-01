const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.route('/')
    .get(paymentController.getPayments)
    .post(paymentController.createPayment);

module.exports = router;
