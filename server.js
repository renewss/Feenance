const mongoose = require('mongoose');
require('dotenv').config();
const app = require('./app');

//
// Catching synchronous errors (exceptions) globally
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION! Shutting down server');

  process.exit(1);
});
//

const DB = process.env.DB.replace('<password>', process.env.DB_PASSWORD);
mongoose.connect(
  DB,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  () => {
    console.log('Successfully connected to DB');
  }
);

const Port = process.env.PORT;
app.listen(Port, () => {
  console.log(`Server Started on Port ${Port}`);
});

// Central error(unhandled promise rejection) handling
process.on('unhandledRejection', (err) => {
  console.log(err);
  console.log('UNHANDLED REJECTION! Shutting down server');

  app.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM recieved. Shutting down server ...........');
  server.close(() => {
    console.log('Server terminated!');
  });
});
