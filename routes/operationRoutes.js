const express = require('express');
const operationController = require('../controllers/operationController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect, authController.restrictTo('Admin'));

router.route('/').post(operationController.create);

module.exports = router;
