const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for automatic expiration
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Note: Token index is automatically created by unique: true constraint (line 12)

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

module.exports = PasswordReset;