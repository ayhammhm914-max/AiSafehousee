const router = require('express').Router();
const ctrl   = require('../controllers/reviewsController');

router.get('/:model_id', ctrl.getByModel);
router.post('/',         ctrl.addReview);

module.exports = router;