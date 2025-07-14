// controllers/authController.js
import User from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import generateToken from '../utils/generateToken.js';
import { sendVerificationEmail } from '../services/emailService.js'; 
import crypto from 'crypto';


// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

     const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
    });

    if (user) {
        await sendVerificationEmail(user.email, user.verificationToken);
      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user.id), // Generate JWT token
        isVerified: user.isVerified,
        message: 'Registration successful. Please verify your email.', // Pesan awal
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};


const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ where: { email } });

    if (user && (await comparePassword(password, user.password))) {
      // Check if email is verified (if feature is enabled)
      if (!user.isVerified) {
         return res.status(401).json({ message: 'Email not verified. Please check your inbox.' });
      }

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user.id), // Generate JWT token
        isVerified: user.isVerified,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.query; // Token akan datang dari query parameter

  try {
    const user = await User.findOne({ where: { verificationToken: token } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token.' });
    }

    // Update user status
    user.isVerified = true;
    user.verificationToken = null; // Clear the token after verification
    await user.save(); // Save changes to the database

    res.status(200).json({ message: 'Email verified successfully! You can now log in.' });
    // Di lingkungan produksi, Anda mungkin ingin mengarahkan pengguna ke halaman login frontend
    // res.redirect(`${process.env.FRONTEND_URL}/auth?verified=true`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during email verification.' });
  }
};

const getMe = async (req, res) => {
  // Data user sudah tersedia di req.user berkat middleware 'protect'
  res.status(200).json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    isVerified: req.user.isVerified,
    createdAt: req.user.createdAt,
  });
};

export { registerUser, loginUser, verifyEmail, getMe };