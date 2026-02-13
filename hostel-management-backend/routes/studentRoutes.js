const express = require('express');
const router = express.Router();
const { getStudents, getStudentProfile, updateStudent, deactivateStudent } = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', authorize('admin', 'warden'), getStudents);
router.get('/:id', getStudentProfile);
router.patch('/:id', updateStudent);
router.delete('/:id', authorize('admin'), deactivateStudent);

module.exports = router;
