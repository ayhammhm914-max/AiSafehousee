const router = require('express').Router();
const ctrl = require('../controllers/aimasterController');
const { requireAuth } = require('../middleware/requireAuth');

router.use(requireAuth);
router.get('/sessions', ctrl.listSessions);
router.post('/sessions', ctrl.createSession);
router.get('/sessions/:sessionId', ctrl.getSession);
router.delete('/sessions/:sessionId', ctrl.removeSession);
router.post('/', ctrl.chat);

module.exports = router;
