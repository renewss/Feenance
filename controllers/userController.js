const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

// // HELPER FUNCTIONS
// const validateLink = async (role, link) => {
//   // 1) check if link is the same as user

//   // 2) case for Admin
//   if (role === 'Admin') return [];

//   // 3) case for Lead
//   if (role === 'Lead') {
//     const admin = await User.findOne({ role: 'Admin' });
//     return [{ branch: 'Main', reference: admin._id }];
//   }

//   // 4) case for User
//   if (Array.isArray(link)) {
//     // 4a) case when no link provided
//     if (link.length === 0) return [];

//     // 4b) case when incorrect link provided
//     let out = new Array();
//     for (const i in link) {
//       const lead = await User.findById(link[i].reference);
//       if (!lead) return new AppError('Lead NOT FOUND', 404);

//       if (lead.role != 'Lead') return new AppError('Link User must be "Lead" only', 400);

//       // 4c) case when correct link provided
//       out.push();
//     }
//   }
// };

//
// My Controllers
exports.getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
});

// Admin Controllers
exports.create = catchAsync(async (req, res, next) => {
  // const links = await Promise.all(
  //   req.body.map(async (val) => {
  //     return validateLink(val.role, val.link);
  //   })
  // );

  // // check whether incorrect links was provided
  // let errMsg;
  // const validate = links.some((val, i) => {
  //   if (val && val.constructor.name === 'AppError') {
  //     errMsg = val;
  //     return true;
  //   } else {
  //     req.body[i].link = val;
  //     return false;
  //   }
  // });
  // if (validate) return next(errMsg);

  const users = await User.create(req.body);

  for (const i in users) {
    users[i].password = undefined;
  }

  res.status(200).json({
    status: 'success',
    message: 'User created',
    data: {
      users,
    },
  });
});

exports.getOne = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select('-__v')
    .populate('link', 'name role ')
    .populate('operations', 'branch opType amount madeAt');

  if (!user) return next(new AppError('User Not Found', 404));

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.getAll = catchAsync(async (req, res, next) => {
  let queryStr = {},
    projection = {};

  // if has query
  if (Object.keys(req.query).length != 0) {
    const excludedFields = ['fields']; // fields used for other purposes
    queryStr = { ...req.query };

    excludedFields.forEach((val) => delete queryStr[val]); // filter
    projection = req.query.fields.split(',').join(' '); // limited fields
  }

  const users = await User.find(JSON.parse(JSON.stringify(queryStr)))
    .select(projection)
    .populate('link', 'name role');

  res.status(200).json({
    status: 'success',
    data: {
      result: users.length,
      users,
    },
  });
});

exports.update = catchAsync(async (req, res, next) => {
  const updatingUser = await User.findById(req.params.id);
  // Prevent changing Admin doc
  if (updatingUser.role === 'Admin') return next(new AppError('Admin cannot be changed', 403));

  // // if link is given, validate
  // if (req.body.link || req.body.role) {
  //   // if link equal to itself
  //   if (req.params.id === req.body.link)
  //     return next(new AppError('Link cannot be on the same User', 400));

  //   // finding current role of the user
  //   const updatingUserRole = req.body.role ? req.body.role : updatingUser.role;

  //   const leadId = await validateLink(updatingUserRole, req.body.link);
  //   if (leadId) {
  //     req.body.link = leadId;
  //     if (leadId.constructor.name === 'AppError') return next(leadId); // Error returned
  //   } else {
  //     req.body.link = null;
  //   }
  // }

  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });

  res.status(200).json({
    status: 'success',
    message: 'User updated',
    data: {
      user,
    },
  });
});

exports.deleteOne = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new AppError('No user found', 404));
  if (user.role === 'Admin') return next(new AppError('Admin cannot be deleted', 403));

  await user.deleteOne();

  res.status(200).json({
    status: 'success',
    message: 'User deleted',
    data: {
      user: null,
    },
  });
});
