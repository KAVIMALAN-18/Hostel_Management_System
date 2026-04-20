const express = require('express');
const router = express.Router();
const { getStudents, getMyProfile, getStudentProfile, updateStudent, deactivateStudent, deletePermanent, getMyFloorStudents, getWardenForStudent } = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/my-floor', authorize('warden'), getMyFloorStudents);
router.get('/warden/:studentId', getWardenForStudent);
router.get('/', authorize('admin', 'warden'), getStudents);
router.get('/profile/me', getMyProfile);
router.get('/:id', getStudentProfile);
router.patch('/:id', updateStudent);
router.put('/:id', updateStudent);
router.delete('/:id', authorize('admin'), deactivateStudent);
router.delete('/:id/permanent', authorize('admin'), deletePermanent);

module.exports = router;
