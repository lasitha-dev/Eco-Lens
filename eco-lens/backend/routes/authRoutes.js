const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('../models/RefreshToken');
const User = require('../models/User');

/**
 * Generate access token (short-lived)
 */
const generateAccessToken = (user) => {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET || 'your-fallback-secret-key', {
    expiresIn: '24h' // Access token expires in 24 hours
  });
};

/**
 * Generate refresh token (long-lived)
 */
const generateRefreshToken = async (userId) => {
  // Generate a secure random token
  const token = crypto.randomBytes(64).toString('hex');
  
  // Set expiration to 7 days
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  // Store in database
  const refreshToken = new RefreshToken({
    userId,
    token,
    expiresAt
  });
  
  await refreshToken.save();
  
  return token;
};

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token required',
        message: 'Please provide a refresh token'
      });
    }
    
    // Find the refresh token in database
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    
    if (!storedToken) {
      return res.status(401).json({
        error: 'Invalid refresh token',
        message: 'The provided refresh token is invalid'
      });
    }
    
    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      // Delete expired token
      await RefreshToken.deleteOne({ _id: storedToken._id });
      
      return res.status(401).json({
        error: 'Refresh token expired',
        message: 'Your refresh token has expired. Please log in again'
      });
    }
    
    // Get the user
    const user = await User.findById(storedToken.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Invalid user',
        message: 'User account no longer exists or is inactive'
      });
    }
    
    // Update last used timestamp
    storedToken.lastUsedAt = new Date();
    await storedToken.save();
    
    // Generate new access token
    const accessToken = generateAccessToken(user);
    
    res.json({
      message: 'Token refreshed successfully',
      token: accessToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
    
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({
      error: 'Token refresh failed',
      message: 'Internal server error during token refresh'
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user and invalidate refresh token
 */
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      // Delete the refresh token from database
      await RefreshToken.deleteOne({ token: refreshToken });
    }
    
    res.json({
      message: 'Logged out successfully'
    });
    
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: 'Internal server error during logout'
    });
  }
});

/**
 * DELETE /api/auth/revoke-all-tokens
 * Revoke all refresh tokens for a user (requires authentication)
 */
router.delete('/revoke-all-tokens', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please provide a valid authentication token'
      });
    }
    
    // Verify the access token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-fallback-secret-key');
    
    // Delete all refresh tokens for this user
    const result = await RefreshToken.deleteMany({ userId: decoded.userId });
    
    res.json({
      message: 'All refresh tokens revoked successfully',
      tokensRevoked: result.deletedCount
    });
    
  } catch (error) {
    console.error('Error revoking tokens:', error);
    res.status(500).json({
      error: 'Token revocation failed',
      message: 'Internal server error during token revocation'
    });
  }
});

module.exports = {
  router,
  generateAccessToken,
  generateRefreshToken
};
