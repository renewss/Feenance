const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const axios = require('axios');
const hpp = require('hpp');
const xss = require('xss');
const compression = require('compression');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const operationRouter = require('./routes/operationRoutes');
const keepAliveRouter = require('./routes/keepAlive');

const app = express();

app.use(helmet());

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(morgan('tiny'));

app.use(mongoSanitize());
app.use(xss());
app.use(hpp({ whitelist: ['user'] }));
app.use(compression());

// ROUTES
app.use('/api/v1/user', userRouter);
app.use('/api/v1/operation', operationRouter);

// Keep Alive
app.use(`/api/v1/keep-alive`, keepAliveRouter);

setInterval(() => {
  axios.get(`${process.env.DOMAIN}api/v1/keep-alive/${process.env.SECRET_PATH}`).catch((err) => {
    console.log(err);
  });
}, 1000 * 60 * 25);

// ERROR HANDLING
// Catching unhandled requests
app.use('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});
// Global error handling
app.use(globalErrorHandler);

module.exports = app;
