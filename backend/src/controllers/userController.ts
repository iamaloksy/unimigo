import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import mongoose from 'mongoose';

// Get user profile
export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
      .populate('universityId')
      .select('-firebaseUid');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    console.error('Get user profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user profile
export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Ensure user can only update their own profile
    if ((req.user!._id as mongoose.Types.ObjectId).toString() !== id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const allowedUpdates = [
      'name',
      'department',
      'year',
      'profileImage',
    ];

    const updates: any = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate('universityId');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    console.error('Update user profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Update roommate preferences
export const updateRoommatePreferences = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if ((req.user!._id as mongoose.Types.ObjectId).toString() !== id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { roommatePreferences: req.body },
      { new: true, runValidators: true }
    ).populate('universityId');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    console.error('Update roommate preferences error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Update study preferences
export const updateStudyPreferences = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if ((req.user!._id as mongoose.Types.ObjectId).toString() !== id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { studyPreferences: req.body },
      { new: true, runValidators: true }
    ).populate('universityId');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    console.error('Update study preferences error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
