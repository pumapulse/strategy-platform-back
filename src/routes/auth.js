const { Router } = require('express');
const { signup, login, verifyEmail, forgotPassword, resetPassword, verifyResetCode, getProfile, updateProfile, uploadAvatar, adminLogin } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.post('/signup', signup);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/avatar', authenticate, uploadAvatar);

module.exports = router;
