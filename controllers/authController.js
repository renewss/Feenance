const jwt = require('jsonwebtoken');
const util = require('util');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

// HELPER FUNCTIONS
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES });
};

const createAndSendToken = (user, status, req, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 1000 * 60 * 60 * 24),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };

  user.password = undefined;

  // res.cookie('jwt', token, cookieOptions);
  res.status(status).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

const validateLink = async (role, id) => {
  // Admin has no link
  if (role === 'Admin') return undefined;

  // for all Leads link is Admin
  if (role === 'Lead') {
    const admin = await User.findOne({ role: 'Admin' });
    return admin._id;
  }

  // if link is given
  if (!id) return;

  const lead = await User.findById(id);
  if (!lead) return new AppError('Lead NOT FOUND', 404);
  if (lead.role !== 'Lead') return new AppError('Link User must be "Lead" only', 400);
  return lead._id;
};
// CONTROLLERS

exports.signup = catchAsync(async (req, res, next) => {
  const leadId = await validateLink(req.body.role, req.body.link);
  if (leadId.constructor.name === 'AppError') return next(leadId);

  const user = await User.create({
    email: req.body.email,
    name: req.body.name,
    role: req.body.role,
    link: leadId,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  createAndSendToken(user, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) return next(new AppError('Provide email and password', 401));

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password)))
    return next(new AppError('Incorrect email or password', 400));

  createAndSendToken(user, 200, req, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10000),
    httpOnly: true,
  });

  res.status(200).json({ status: 'success', data: { message: 'Logged out' } });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else {
    token = req.cookies.jwt;
  }

  if (!token) return next(new AppError('You are not authorized. Please, log in', 401));

  // Token verification
  const decoded = await util.promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Finding current user
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) return next(new AppError('User does not exists!', 401));

  // TODO: Checking if password have not been changed

  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return next(new AppError('Not Allowed Action', 403));

    next();
  };
};
