const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const { sendPasswordResetEmail } = require('../utils/sendEmail');

const router = express.Router();

// Test email endpoint (for development only)
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Generate a test token
    const testToken = 'test-token-' + Date.now();
    
    // Send test email
    const result = await sendPasswordResetEmail(email, testToken);
    
    res.json({ 
      message: 'Test email sent successfully',
      result: result
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      message: 'Failed to send test email',
      error: error.message 
    });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return the same message for security
    const responseMessage = 'If this email is registered, a reset link has been sent. Please check your inbox or spam folder.';

    // If user doesn't exist, still return success message
    if (!user) {
      return res.json({ message: responseMessage });
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');

    // Set expiration to 15 minutes from now
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Save token in database
    const passwordReset = new PasswordReset({
      userId: user._id,
      token,
      expiresAt
    });

    await passwordReset.save();

    // Send email
    try {
      const emailResult = await sendPasswordResetEmail(email, token);
      console.log(`✅ Password reset email sent to ${email}`, emailResult);
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      // Clean up the token since email failed to send
      await PasswordReset.deleteOne({ _id: passwordReset._id });
      // Don't return error to user for security, but log it
    }

    res.json({ message: responseMessage });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/verify-reset-token
router.get('/verify-reset-token', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    // Find token in database
    const passwordReset = await PasswordReset.findOne({ token });

    if (!passwordReset) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Check if token has expired
    if (passwordReset.expiresAt < new Date()) {
      // Clean up expired token
      await PasswordReset.deleteOne({ _id: passwordReset._id });
      return res.status(400).json({ message: 'Token has expired' });
    }

    res.json({ message: 'Token is valid' });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    // Validate password strength
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    const isLongEnough = newPassword.length >= 8;

    if (!hasUpperCase || !hasNumber || !hasSpecialChar || !isLongEnough) {
      return res.status(400).json({ 
        message: 'Password must contain uppercase letter, number, special character, and be at least 8 characters' 
      });
    }

    // Find token in database
    const passwordReset = await PasswordReset.findOne({ token });

    if (!passwordReset) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Check if token has expired
    if (passwordReset.expiresAt < new Date()) {
      // Clean up expired token
      await PasswordReset.deleteOne({ _id: passwordReset._id });
      return res.status(400).json({ message: 'Token has expired' });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user's password
    const updatedUser = await User.findByIdAndUpdate(
      passwordReset.userId, 
      { password: hashedPassword },
      { new: true, select: 'email firstName lastName' }
    );

    // Delete the token after use
    await PasswordReset.deleteOne({ _id: passwordReset._id });

    console.log(`✅ Password reset successful for user: ${updatedUser.email}`);

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;