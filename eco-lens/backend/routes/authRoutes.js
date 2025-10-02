
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Generate JWT token function
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET || 'your-fallback-secret-key',
    { expiresIn: '24h' }
  );
};

// Initiate Google OAuth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      // Successful authentication
      const token = generateToken(req.user);
      
      // Redirect to success endpoint with token
      res.redirect(`/api/auth/google/success?token=${token}&userId=${req.user._id}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect('/login?error=auth_failed');
    }
  }
);

// Success endpoint - returns user data and token
router.get('/google/success', async (req, res) => {
  try {
    const { token, userId } = req.query;
    
    if (!token || !userId) {
      return res.status(400).json({ error: 'Missing token or user ID' });
    }
    
    // Verify the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      message: 'Google authentication successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role || 'customer',
        profilePictureUrl: user.profilePictureUrl
      }
    });
  } catch (error) {
    console.error('Success endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

