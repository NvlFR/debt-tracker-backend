// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Impor model User
import dotenv from 'dotenv';

dotenv.config();

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password', 'verificationToken', 'passwordResetToken', 'passwordResetExpires'] }
      });

      // Check if user exists
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next(); // Lanjutkan ke rute berikutnya
    } catch (error) {
      console.error('Error in auth middleware:', error);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Not authorized, token expired' });
      }
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export { protect };