const { Router } = require('express');
const { signup, login, verifyEmail, getProfile, updateProfile, uploadAvatar, adminLogin, googleCallback } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.post('/signup', signup);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.post('/google-callback', googleCallback);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/avatar', authenticate, uploadAvatar);

module.exports = router;
