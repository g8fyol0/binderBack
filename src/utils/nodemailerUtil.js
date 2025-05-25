const nodemailer = require('nodemailer');

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD // Use app password, not your regular password
  }
});

/**
 * Send OTP email for verification
 * @param {string} to - Recipient email
 * @param {string} otp - One-time password
 * @param {string} firstName - User's first name
 */
const sendOTPEmail = async (to, otp, firstName) => {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: to,
      subject: 'Verify Your Email for Binder Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">Hello ${firstName},</h2>
          <p>Thank you for signing up with Binder. To complete your registration, please verify your email address using the OTP below:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="font-size: 32px; margin: 0; letter-spacing: 5px; color: #4a4a4a;">${otp}</h1>
          </div>
          <p>This OTP is valid for 10 minutes. If you didn't request this verification, please ignore this email.</p>
          <p>Best regards,<br>The Binder Team</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = { sendOTPEmail };