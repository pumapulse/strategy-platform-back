const { Router } = require('express');
const { requireAdmin } = require('../middleware/auth');
const {
  getUsers, deleteUser,
  getStrategies, createStrategy, updateStrategy, deleteStrategy,
  getDiscussions, deleteDiscussion,
  getAlerts, createAlert, deleteAlert,
  getStats, getPayments,
} = require('../controllers/adminController');

const router = Router();

router.use(requireAdmin);

router.get('/stats', getStats);

router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);

router.get('/strategies', getStrategies);
router.post('/strategies', createStrategy);
router.put('/strategies/:id', updateStrategy);
router.delete('/strategies/:id', deleteStrategy);

router.get('/discussions', getDiscussions);
router.delete('/discussions/:id', deleteDiscussion);

router.get('/alerts', getAlerts);
router.post('/alerts', createAlert);
router.delete('/alerts/:id', deleteAlert);

router.get('/payments', getPayments);

module.exports = router;
