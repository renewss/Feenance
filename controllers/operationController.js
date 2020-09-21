const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Operation = require('../models/operationModel');
const User = require('../models/userModel');

exports.create = catchAsync(async (req, res, next) => {
  const operations = await Operation.create(req.body);

  let prms = new Array();
  for (val of operations) {
    const user = await User.findById(val.user);
    if (!user) return next(new AppError('No User Found for given link', 404));

    user.calculateBalance(val);
    user.confirmPassword = user.password;
    prms.push(user.save({ validateBeforeSave: false }));
  }
  await Promise.all(prms);

  res.status(200).json({
    status: 'success',
    data: {
      operations,
    },
  });
});

exports.getOne = catchAsync(async (req, res, next) => {
  const operation = await Operation.findById(req.params.id).populate('user', 'name');

  if (!operation) return next(new AppError('Operation Not Found', 404));

  res.status(200).json({
    status: 'success',
    data: {
      operation,
    },
  });
});

exports.getAll = catchAsync(async (req, res, next) => {
  let queryStr = {},
    projection = {};

  if (Object.keys(req.query).length != 0) {
    const excludedFields = ['fields']; // fields used for other purposes
    queryStr = { ...req.query };

    excludedFields.forEach((val) => delete queryStr[val]); // filter
    projection = req.query.fields.split(',').join(' '); // limited fields
  }

  const operations = await Operation.find(JSON.parse(JSON.stringify(queryStr)))
    .select(projection)
    .populate('user', 'name');

  res.status(200).json({
    status: 'success',
    data: {
      result: operations.length,
      operations,
    },
  });
});

exports.deleteOne = catchAsync(async (req, res, next) => {
  const operation = await Operation.findByIdAndDelete(req.params.id);

  if (!operation) return next(new AppError('Operation Not Found', 404));

  res.status(200).json({
    status: 'success',
    message: 'Successfully deleted',
    data: {
      operation: null,
    },
  });
});
