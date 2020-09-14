const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const AppError = require('../utils/appError');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength: 4,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      minlength: 4,
      unique: true,
      required: true,
    },
    telNumber: {
      type: String,
      minlength: 7,
    },
    role: {
      type: String,
      enum: ['Lead', 'User'], // 'Admin' must be created from DB
      default: 'User',
    },
    // link to elder rank users, User -> Lead, Lead -> Admin
    link: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    password: {
      type: String,
      minlength: 4,
      required: true,
      select: false,
    },
    confirmPassword: {
      type: String,
      required: true,
      validate: {
        validator: function (val) {
          return this.password === val;
        },
        message: 'Passwords do NOT match',
      },
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    lastvisit: {
      type: Date,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate
userSchema.virtual('operations', {
  ref: 'Operation',
  foreignField: 'user',
  localField: '_id',
});

userSchema.virtual('currentAmount').get(async function () {
  await this.populate('operations');

  let amount = 0;
  this.operations.forEach((val) => {
    if (val.opType === 'Debt') amount -= val.amount * 1;
    else amount += val.amount * 1;
  });

  return amount;
});

// MIDDLEWARES
userSchema.pre('save', async function (next) {
  // if (!this.isModified('password')) return next();

  // this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

// METHODS
userSchema.methods.correctPassword = async function (candidate) {
  // return await bcrypt.compare(candidate, this.password);
  return this.password === candidate;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
