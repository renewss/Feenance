const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

// router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

router.use(authController.protect);
// Protected My Routes
router.route('/me').get(userController.getMe);

// Lead Routes
router.route('/my').get(authController.restrictTo('Lead'), userController.getMy);

// Admin Routes
router.use(authController.restrictTo('Admin'));
router
  .route('/')
  .get(userController.getAll)
  .post(userController.create)
  .delete(userController.deleteUsers);
router
  .route('/:id')
  .get(userController.getOne)
  .patch(userController.update)
  .delete(userController.deleteOne);

module.exports = router;
