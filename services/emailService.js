// services/emailService.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter using SMTP settings from .env
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true', // Use 'true' for port 465, 'false' for 587/2525
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (email, token) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`; // <--- PENTING! Kita perlu menambahkan FRONTEND_URL di .env

  const mailOptions = {
    from: process.env.EMAIL_USER, // Alamat email pengirim (biasanya sama dengan EMAIL_USER)
    to: email,
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Email Verification</h2>
        <p>Thank you for registering with Debt Tracker App. Please verify your email address by clicking the link below:</p>
        <p>
          <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; margin: 20px 0; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
        </p>
        <p>If you did not register for an account, please ignore this email.</p>
        <p>Best regards,<br/>The Debt Tracker Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending verification email to ${email}:`, error);
  }
};

export { sendVerificationEmail };