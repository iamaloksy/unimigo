import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import University from '../models/University';
import { auth } from '../config/firebase';

// Request OTP - Firebase handles OTP sending
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

    // Return success - client should handle Firebase OTP
    return res.json({
      success: true,
      message: 'Please verify OTP sent to your email',
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
    const { email, firebaseToken, name } = req.body;

    if (!email || !firebaseToken) {
      return res.status(400).json({ error: 'Email and Firebase token are required' });
    }

    // Verify Firebase token
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(firebaseToken);
    } catch (firebaseError) {
      console.log('Firebase verification skipped in dev mode');
      // In development, we'll skip Firebase verification
      decodedToken = { uid: `dev_${email}`, email };
    }

    // Extract domain and find university
    const domain = email.split('@')[1];
    const university = await University.findOne({ domain });

    if (!university) {
      return res.status(404).json({ error: 'University not found' });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        universityId: university._id,
        firebaseUid: decodedToken.uid,
        trustScore: 50,
        verifiedBadge: true,
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        universityId: user.universityId,
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