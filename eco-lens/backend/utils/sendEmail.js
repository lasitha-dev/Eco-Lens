const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // This should be an app password for Gmail
  }
});

// Function to send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const resetLink = `eco-lens://reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request - Eco Lens',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2E7D32; margin: 0;">🌱 Eco Lens</h1>
            <h2 style="color: #4CAF50; margin: 10px 0;">Password Reset Request</h2>
          </div>

          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0 0 15px 0; color: #333;">
              Hello,
            </p>
            <p style="margin: 0 0 15px 0; color: #333;">
              You have requested to reset your password for your Eco Lens account. Click the button below to reset your password:
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}"
                 style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>

            <p style="margin: 20px 0 10px 0; color: #666; font-size: 14px;">
              <strong>Important:</strong> This link will expire in 15 minutes for security reasons.
            </p>

            <p style="margin: 10px 0; color: #666; font-size: 14px;">
              If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
            </p>
          </div>

          <div style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
            <p>This is an automated message from Eco Lens. Please do not reply to this email.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

module.exports = {
  sendPasswordResetEmail
};