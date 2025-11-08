import express from 'express';
import { requestOTP, verifyOTP, getCurrentUser } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTP);
router.get('/me', authenticateToken, getCurrentUser);

export default router;