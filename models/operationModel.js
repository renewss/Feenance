const mongoose = require('mongoose');

const operationSchema = new mongoose.Schema({
  opType: {
    type: String,
    enum: ['Debt', 'Payment', 'Return'],
    required: true,
  },
  branch: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  madeAt: {
    type: Date,
    default: Date.now(),
    required: true,
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const Operation = mongoose.model('Operation', operationSchema);

module.exports = Operation;
