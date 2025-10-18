const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
  },
  address: {
    type: String,
    default: 'Not provided',
    trim: true
  },
  dateOfBirth: {
    type: Date,
    default: Date.now
  },
  country: {
    type: String,
    default: 'Not provided'
  },
  phone: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    minlength: 8
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    default: 'prefer-not-to-say'
  },
  profilePicture: {
    type: String, // URI or URL of the profile picture
    default: null
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  fingerprintEnabled: {
    type: Boolean,
    default: false
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;