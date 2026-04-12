const router = require('express').Router();
const ctrl   = require('../controllers/aimasterController');

router.post('/', ctrl.chat);

module.exports = router;