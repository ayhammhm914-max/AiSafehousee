const router = require('express').Router();
const ctrl = require('../controllers/accountController');
const { requireAuth } = require('../middleware/requireAuth');

router.get('/', requireAuth, ctrl.getProfile);

module.exports = router;
