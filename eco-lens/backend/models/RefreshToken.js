const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
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
  },
  lastUsedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for automatic expiration
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for efficient userId lookup
refreshTokenSchema.index({ userId: 1 });

// Note: Token index is automatically created by unique: true constraint

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken;
