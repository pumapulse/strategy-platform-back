const { Router } = require('express');
const { toggleFollow, getFollowStatus } = require('../controllers/followController');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.post('/:userId', authenticate, toggleFollow);
router.get('/:userId/status', authenticate, getFollowStatus);

module.exports = router;
