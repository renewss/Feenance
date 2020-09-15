const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const axios = require('axios');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const operationRouter = require('./routes/operationRoutes');
const keepAliveRouter = require('./routes/keepAlive');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(morgan('tiny'));

app.get('/', (req, res, next) => {
  res.json({ text: 'Test Message' });
});

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
