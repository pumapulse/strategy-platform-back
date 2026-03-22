const { Router } = require('express');
const { signup, login, getProfile, updateProfile, uploadAvatar, adminLogin } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/avatar', authenticate, uploadAvatar);

module.exports = router;
