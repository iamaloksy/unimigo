import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import University from '../models/University';
import { sendOTPEmail } from '../config/email';
import { auth } from '../config/firebase';

// Store OTPs temporarily (in production use Redis)
const otpStore = new Map<string, string>();

// Request OTP
export const requestOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Extract domain from email
    const domain = email.split('@')[1];
    
    // Block public domains
    const publicDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
    if (publicDomains.includes(domain)) {
      return res.status(400).json({ 
        error: 'Public email domains not allowed',
        message: 'Please use your university email address'
      });
    }

    // Check if university exists for this domain
    let university = await University.findOne({ domain });

    if (!university) {
      return res.status(404).json({
        error: 'University not found',
        message: 'Your university is not yet onboarded. Please contact admin.',
        domain,
        needsOnboarding: true
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, otp);
    
    // Auto-delete OTP after 10 minutes
    setTimeout(() => otpStore.delete(email), 10 * 60 * 1000);

    // Send OTP via email
    try {
      await sendOTPEmail(email, otp, university.name);
    } catch (emailError) {
      console.error('Email sending failed, but OTP is generated:', emailError);
    }

    return res.json({
      success: true,
      message: 'OTP sent to your email',
      universityId: university._id,
      universityName: university.name
    });
  } catch (error) {
    console.error('Request OTP error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Verify OTP and create/login user
export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp, name, department, year, phone } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Verify OTP
    const storedOTP = otpStore.get(email);
    if (!storedOTP || storedOTP !== otp) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    // Delete used OTP
    otpStore.delete(email);

    // Extract domain and find university
    const domain = email.split('@')[1];
    const university = await University.findOne({ domain });

    if (!university) {
      return res.status(404).json({ error: 'University not found' });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user with registration data
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        universityId: university._id,
        department: department || undefined,
        year: year || undefined,
        phone: phone || undefined,
        trustScore: 50,
        verifiedBadge: true,
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, tokenVersion: user.tokenVersion },
      process.env.JWT_SECRET!,
      { expiresIn: '90d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        universityId: user.universityId,
        department: user.department,
        year: user.year,
        phone: user.phone,
        bio: user.bio,
        trustScore: user.trustScore,
        verifiedBadge: user.verifiedBadge,
        profileImage: user.profileImage,
      },
      university: {
        id: university._id,
        name: university.name,
        theme: university.theme,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get current user
export const getCurrentUser = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('universityId')
      .select('-firebaseUid');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Logout current user
export const logout = async (req: any, res: Response) => {
  try {
    // Invalidate user's token by incrementing tokenVersion
    await User.findByIdAndUpdate(req.user._id, { $inc: { tokenVersion: 1 } });
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Logout all users
export const logoutAllUsers = async (req: Request, res: Response) => {
  try {
    await User.updateMany({}, { $inc: { tokenVersion: 1 } });
    return res.json({ success: true, message: 'All users logged out' });
  } catch (error) {
    console.error('Logout all users error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};