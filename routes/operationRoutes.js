const express = require('express');
const operationController = require('../controllers/operationController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect, authController.restrictTo('Admin'));

router
  .route('/')
  .get(operationController.getAll)
  .post(operationController.create)
  .delete(operationController.dropCollection);
router.route('/:id').get(operationController.getOne).delete(operationController.deleteOne);

module.exports = router;
