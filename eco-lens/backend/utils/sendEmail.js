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
    // For React Native/Expo app, we need to provide instructions for manual token entry
    // since deep links may not work in development
    const resetInstructions = `
      To reset your password:
      1. Open the Eco-Lens app on your mobile device
      2. Go to the Reset Password screen
      3. Enter this reset code: ${resetToken}
    `;
    
    // Alternative: Create a simple web page for token handling (future enhancement)
    const resetLink = `exp://localhost:8081/--/reset-password?token=${resetToken}`; // Expo development link

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
              You have requested to reset your password for your Eco Lens account.
            </p>

            <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
              <h3 style="margin: 0 0 10px 0; color: #2E7D32;">Reset Instructions:</h3>
              <ol style="margin: 0; padding-left: 20px; color: #333;">
                <li>Open the <strong>Eco-Lens app</strong> on your mobile device</li>
                <li>Navigate to <strong>Login → Forgot Password → Reset Password</strong></li>
                <li>Enter your <strong>Reset Code</strong> when prompted</li>
              </ol>
            </div>

            <div style="background-color: #fff; padding: 15px; border-radius: 8px; border: 2px dashed #4CAF50; text-align: center; margin: 20px 0;">
              <p style="margin: 0 0 10px 0; color: #2E7D32; font-weight: bold;">Your Reset Code:</p>
              <p style="margin: 0; font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; color: #1B5E20; letter-spacing: 2px;">${resetToken}</p>
            </div>
            
            <p style="margin: 10px 0; color: #666; font-size: 14px;">
              <strong>Alternative:</strong> If you're using Expo Go, you can click this link: <br>
              <a href="${resetLink}" style="color: #4CAF50; word-break: break-all;">${resetLink}</a>
            </p>

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