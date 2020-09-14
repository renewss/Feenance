const AppError = require('../utils/appError');

const handleCastErrorDb = (err) => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};

const handleDuplicateErrorDb = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// eslint-disable-next-line no-unused-vars
const handleJWTError = (err) => new AppError('Invalid token! Please login again', 401);

// eslint-disable-next-line no-unused-vars
const handleJWTExpiredError = (err) =>
  new AppError('Your token has expired! Please login again', 401);

//
// ERROR SENDERS
const sendDevError = (err, req, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendProdError = (err, req, res) => {
  // Errors generated in application (Trusted errors)
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // Other errors, prevent leaking to client
  else {
    console.log('ERROR*********', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendDevError(err, req, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'Cast Error') error = handleCastErrorDb(err);
    if (err.code === 11000) error = handleDuplicateErrorDb(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError(err);
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError(err);

    sendProdError(error, req, res);
  }
};
