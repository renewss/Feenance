const express = require('express');

const router = express.Router();

router.route(`/${process.env.SECRET_PATH}`).get((req, res, next) => {
  res.status(200).json({});
});

module.exports = router;
