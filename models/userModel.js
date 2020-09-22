const mongoose = require('mongoose');

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
    link: [
      {
        branch: {
          type: String,
        },
        reference: {
          type: mongoose.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
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
    balance: [
      {
        branch: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
      },
    ],
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

userSchema.methods.calculateBalance = function (operation) {
  if (!operation) return;

  if (this.balance.length === 0 || !this.balance.some((val) => val.branch === operation.branch)) {
    this.balance.push({ branch: operation.branch, amount: 0 });
  }

  for (i in this.balance) {
    if (this.balance[i].branch === operation.branch) {
      if (operation.opType === 'Debt') this.balance[i].amount -= operation.amount * 1;
      else this.balance[i].amount += operation.amount * 1;
    }
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
