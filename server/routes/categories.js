const router = require('express').Router();
const ctrl   = require('../controllers/categoriesController');

router.get('/', ctrl.getAll);

module.exports = router;