// routes/authRoutes.js
import express from 'express';
import { registerUser, loginUser, verifyEmail, getMe } from '../controllers/authController.js'; 
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify-email', verifyEmail); 
router.get('/me', protect, getMe);


export default router;