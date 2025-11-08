import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import RoommatePost from '../models/RoommatePost';
import User from '../models/User';
import cloudinary from '../config/cloudinary';

// Create roommate post
export const createRoommatePost = async (req: AuthRequest, res: Response) => {
  try {
    const postData = {
      ...req.body,
      authorId: req.user._id,
      universityId: req.universityId,
    };

    const post = await RoommatePost.create(postData);
    const populatedPost = await RoommatePost.findById(post._id)
      .populate('authorId', 'name email profileImage trustScore')
      .populate('universityId', 'name');

    return res.status(201).json({ post: populatedPost });
  } catch (error) {
    console.error('Create roommate post error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all roommate posts
export const getRoommatePosts = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      minRent, 
      maxRent, 
      sharingType, 
      genderPreference, 
      available,
      page = 1,
      limit = 20 
    } = req.query;

    const query: any = { universityId: req.universityId };

    if (minRent || maxRent) {
      query.rent = {};
      if (minRent) query.rent.$gte = Number(minRent);
      if (maxRent) query.rent.$lte = Number(maxRent);
    }

    if (sharingType) query.sharingType = sharingType;
    if (genderPreference) query.genderPreference = genderPreference;
    if (available !== undefined) query.available = available === 'true';

    const posts = await RoommatePost.find(query)
      .populate('authorId', 'name email profileImage trustScore')
      .populate('universityId', 'name')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await RoommatePost.countDocuments(query);

    return res.json({
      posts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get roommate posts error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single roommate post
export const getRoommatePost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const post = await RoommatePost.findById(id)
      .populate('authorId', 'name email profileImage trustScore')
      .populate('universityId', 'name');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    return res.json({ post });
  } catch (error) {
    console.error('Get roommate post error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Update roommate post
export const updateRoommatePost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const post = await RoommatePost.findById(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updatedPost = await RoommatePost.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('authorId', 'name email profileImage trustScore')
      .populate('universityId', 'name');

    return res.json({ post: updatedPost });
  } catch (error) {
    console.error('Update roommate post error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete roommate post
export const deleteRoommatePost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const post = await RoommatePost.findById(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await RoommatePost.findByIdAndDelete(id);
    return res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete roommate post error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// AI Roommate Matching
export const matchRoommates = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user || !user.roommatePreferences) {
      return res.status(400).json({ 
        error: 'Please set your roommate preferences first' 
      });
    }

    const userPrefs = user.roommatePreferences;
    
    // Find all users in same university with roommate preferences
    const potentialRoommates = await User.find({
      universityId: req.universityId,
      _id: { $ne: req.user._id },
      roommatePreferences: { $exists: true },
    });

    // Calculate compatibility scores
    const matches = potentialRoommates.map((roommate) => {
      const rmPrefs = roommate.roommatePreferences!;
      let score = 0;
      let factors: any = {};

      // Budget compatibility (25%)
      if (userPrefs.budget && rmPrefs.budget) {
        const budgetOverlap = Math.min(
          userPrefs.budget.max || 0,
          rmPrefs.budget.max || 0
        ) - Math.max(
          userPrefs.budget.min || 0,
          rmPrefs.budget.min || 0
        );
        factors.budget = budgetOverlap > 0 ? 25 : 0;
        score += factors.budget;
      }

      // Cleanliness match (20%)
      if (userPrefs.cleanliness && rmPrefs.cleanliness) {
        const cleanDiff = Math.abs(userPrefs.cleanliness - rmPrefs.cleanliness);
        factors.cleanliness = Math.max(0, 20 - cleanDiff * 5);
        score += factors.cleanliness;
      }

      // Sleep schedule match (15%)
      if (userPrefs.sleepSchedule === rmPrefs.sleepSchedule) {
        factors.sleepSchedule = 15;
        score += 15;
      }

      // Study habits match (15%)
      if (userPrefs.studyHabits === rmPrefs.studyHabits) {
        factors.studyHabits = 15;
        score += 15;
      }

      // Food type match (10%)
      if (userPrefs.foodType === rmPrefs.foodType || 
          userPrefs.foodType === 'any' || 
          rmPrefs.foodType === 'any') {
        factors.foodType = 10;
        score += 10;
      }

      // Smoking match (10%)
      if (userPrefs.smoking === rmPrefs.smoking) {
        factors.smoking = 10;
        score += 10;
      }

      // Pets match (5%)
      if (userPrefs.pets === rmPrefs.pets) {
        factors.pets = 5;
        score += 5;
      }

      return {
        user: {
          id: roommate._id,
          name: roommate.name,
          email: roommate.email,
          profileImage: roommate.profileImage,
          trustScore: roommate.trustScore,
          department: roommate.department,
          year: roommate.year,
        },
        score: Math.round(score),
        factors,
        preferences: rmPrefs,
      };
    });

    // Sort by score and return top 5
    const topMatches = matches
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return res.json({ matches: topMatches });
  } catch (error) {
    console.error('Match roommates error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};