const express = require('express');
const router = express.Router();
const { authenticate: protect, authorize } = require('../middleware/auth');
const {
    getWardens,
    updateWarden,
    getWardenStats
} = require('../controllers/wardenController');

router.use(protect);
router.use(authorize('admin'));

router.get('/', getWardens);
router.patch('/:id', updateWarden);
router.get('/stats', getWardenStats);

module.exports = router;
