const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const operationRouter = require('./routes/operationRoutes');

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

// ERROR HANDLING
// Catching unhandled requests
app.use('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});
// Global error handling
app.use(globalErrorHandler);

module.exports = app;
