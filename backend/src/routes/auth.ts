import express from 'express';
import { requestOTP, verifyOTP, getCurrentUser, logoutAllUsers, logout } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import User from '../models/User';
import { uploadProfileImage } from '../config/cloudinary';

const router = express.Router();

router.post('/request-otp', requestOTP);
router.post('/check-user', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    res.json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
router.post('/verify-otp', verifyOTP);
router.get('/me', authenticateToken, getCurrentUser);
router.put('/profile', authenticateToken, async (req: any, res) => {
  try {
    const { name, bio, department, year, phone, profileImage } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, department, year, phone, profileImage },
      { new: true }
    ).populate('universityId');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.post('/upload-profile-image', authenticateToken, async (req: any, res) => {
  try {
    const { imageBase64 } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data required' });
    }

    // Upload to Cloudinary with background removal
    const imageUrl = await uploadProfileImage(imageBase64, req.user._id);
    
    // Update user profile
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: imageUrl },
      { new: true }
    ).populate('universityId');

    res.json({ user, imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

router.post('/logout', authenticateToken, logout);
router.post('/logout-all', logoutAllUsers);

export default router;