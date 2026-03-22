const { Router } = require('express');
<<<<<<< HEAD
const { signup, login, getProfile, updateProfile, uploadAvatar, adminLogin } = require('../controllers/authController');
=======
const { signup, login, getProfile } = require('../controllers/authController');
>>>>>>> 088f87957ad536d3d27b403fd3e63ac554ccaa15
const { authenticate } = require('../middleware/auth');

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
<<<<<<< HEAD
router.post('/admin-login', adminLogin);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/avatar', authenticate, uploadAvatar);
=======
router.get('/profile', authenticate, getProfile);
>>>>>>> 088f87957ad536d3d27b403fd3e63ac554ccaa15

module.exports = router;
