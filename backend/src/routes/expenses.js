const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/expenseController');

router.use(auth);

router.get('/stats', ctrl.getStats);
router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
