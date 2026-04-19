const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { requireAuth } = require('../middleware/requireAuth');

router.get('/providers', ctrl.getProviders);
router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/logout', ctrl.logout);
router.get('/me', requireAuth, ctrl.me);
router.get('/google', ctrl.startGoogle);
router.get('/google/callback', ctrl.googleCallback);
router.get('/apple', ctrl.startApple);
router.get('/apple/callback', ctrl.appleCallback);
router.post('/apple/callback', ctrl.appleCallback);

module.exports = router;
