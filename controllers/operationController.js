const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Operation = require('../models/operationModel');

exports.create = catchAsync(async (req, res, next) => {
  const operations = await Operation.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      operations,
    },
  });
});
