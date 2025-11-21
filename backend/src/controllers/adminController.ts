import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';
import User from '../models/User';
import University from '../models/University';
import RoommatePost from '../models/RoommatePost';
import Report from '../models/Report';
import Settings from '../models/Settings';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';

export const adminLogin = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { adminId: admin._id, role: admin.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      admin: {
        _id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        universityId: admin.universityId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const totalUsers = await User.countDocuments();
    const totalUniversities = await University.countDocuments();
    const totalPosts = await RoommatePost.countDocuments();
    const activeUsers = await User.countDocuments({ verifiedBadge: true });

    // Calculate trends
    const usersLastWeek = await User.countDocuments({ createdAt: { $gte: lastWeek } });
    const universitiesLastMonth = await University.countDocuments({ createdAt: { $gte: lastMonth } });
    const postsToday = await RoommatePost.countDocuments({ createdAt: { $gte: today } });

    res.json({
      totalUsers,
      activeUsers,
      totalPosts,
      totalUniversities,
      trends: {
        usersThisWeek: usersLastWeek,
        universitiesThisMonth: universitiesLastMonth,
        postsToday: postsToday,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUniversities = async (req: AuthRequest, res: Response) => {
  try {
    const universities = await University.find().sort({ createdAt: -1 }).lean();
    res.json(universities);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUniversitiesList = async (req: AuthRequest, res: Response) => {
  try {
    const universities = await University.find(
      { subscriptionStatus: 'active' },
      'name domain logoUrl'
    ).sort({ name: 1 });
    res.json(universities);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().populate('universityId').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUniversityStats = async (req: AuthRequest, res: Response) => {
  try {
    const { universityId } = req.params;

    const totalUsers = await User.countDocuments({ universityId });
    const activeUsers = await User.countDocuments({ universityId, verifiedBadge: true });
    const totalPosts = await RoommatePost.countDocuments({ universityId });
    const flaggedPosts = 0; // Add when you have flagged posts

    res.json({
      totalUsers,
      activeUsers,
      totalPosts,
      flaggedPosts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUniversityUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { universityId } = req.params;
    const users = await User.find({ universityId }).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUniversityPosts = async (req: AuthRequest, res: Response) => {
  try {
    const { universityId } = req.params;
    const posts = await RoommatePost.find({ universityId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { subscriptionStatus, subscriptionExpiryDate } = req.body;

    const university = await University.findByIdAndUpdate(
      id,
      { subscriptionStatus, subscriptionExpiryDate },
      { new: true }
    );

    res.json(university);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const checkExpiredSubscriptions = async () => {
  try {
    const now = new Date();
    await University.updateMany(
      {
        subscriptionStatus: 'active',
        subscriptionExpiryDate: { $lte: now }
      },
      { subscriptionStatus: 'inactive' }
    );
  } catch (error) {
    console.error('Error checking expired subscriptions:', error);
  }
};

export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      settings = await Settings.findOneAndUpdate({}, req.body, { new: true });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createUniversity = async (req: AuthRequest, res: Response) => {
  try {
    const { name, domain, adminEmail, logoUrl, adminPassword } = req.body;

    // Create university
    const university = new University({
      name,
      domain,
      adminEmail,
      logoUrl,
      subscriptionStatus: 'active',
    });
    await university.save();

    // Generate portal URL with university ID
    const portalUrl = `http://localhost:8081?university=${university._id}`;

    // Create university admin
    const hashedPassword = await bcrypt.hash(adminPassword || 'admin123', 10);
    const universityAdmin = new Admin({
      email: adminEmail,
      password: hashedPassword,
      name: `${name} Admin`,
      role: 'university-admin',
      universityId: university._id,
    });
    await universityAdmin.save();

    res.status(201).json({
      university,
      admin: {
        email: adminEmail,
        password: adminPassword || 'admin123'
      },
      portalUrl
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUniversity = async (req: AuthRequest, res: Response) => {
  try {
    const { name, domain, adminEmail, logoUrl } = req.body;
    const university = await University.findByIdAndUpdate(
      req.params.id,
      { name, domain, adminEmail, logoUrl },
      { new: true }
    );
    res.json(university);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteUniversity = async (req: AuthRequest, res: Response) => {
  try {
    await University.findByIdAndDelete(req.params.id);
    res.json({ message: 'University deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Report management functions
export const getUniversityReports = async (req: AuthRequest, res: Response) => {
  try {
    const { universityId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    const query: any = { universityId };

    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const reports = await Report.find(query)
      .populate('reportedBy', 'email name')
      .populate('reportedUser', 'email name')
      .populate('reportedPost', 'title')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Report.countDocuments(query);

    res.json({
      reports,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createReport = async (req: AuthRequest, res: Response) => {
  try {
    const { reportedUser, reportedPost, reason, description } = req.body;
    const universityId = req.admin?.universityId;

    if (!universityId) {
      return res.status(403).json({ message: 'University admin access required' });
    }

    const report = new Report({
      reportedBy: req.admin._id,
      reportedUser,
      reportedPost,
      universityId,
      reason,
      description,
      status: 'pending'
    });

    await report.save();
    await report.populate('reportedBy', 'email name');
    await report.populate('reportedUser', 'email name');
    await report.populate('reportedPost', 'title');

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateReportStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (status === 'resolved' || status === 'dismissed') {
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = req.admin?._id;
    }

    const report = await Report.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
    .populate('reportedBy', 'email name')
    .populate('reportedUser', 'email name')
    .populate('reportedPost', 'title')
    .populate('resolvedBy', 'name');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getReportStats = async (req: AuthRequest, res: Response) => {
  try {
    const { universityId } = req.params;

    const totalReports = await Report.countDocuments({ universityId });
    const pendingReports = await Report.countDocuments({ universityId, status: 'pending' });
    const resolvedReports = await Report.countDocuments({ universityId, status: 'resolved' });
    const dismissedReports = await Report.countDocuments({ universityId, status: 'dismissed' });

    // Get recent reports (last 30 days)
    const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentReports = await Report.countDocuments({
      universityId,
      createdAt: { $gte: lastMonth }
    });

    // Get today's reports
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaysReports = await Report.countDocuments({
      universityId,
      createdAt: { $gte: today }
    });

    res.json({
      total: totalReports,
      pending: pendingReports,
      resolved: resolvedReports,
      dismissed: dismissedReports,
      recent: recentReports,
      today: todaysReports
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getRecentReports = async (req: AuthRequest, res: Response) => {
  try {
    const { universityId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    const reports = await Report.find({ universityId })
      .populate('reportedBy', 'email name')
      .populate('reportedUser', 'email name')
      .populate('reportedPost', 'title')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin account management functions
export const getAdminProfile = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.admin?._id;

    if (!adminId) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      universityId: admin.universityId
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateAdminProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email } = req.body;
    const adminId = req.admin?._id;

    if (!adminId) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      { name, email },
      { new: true }
    );

    if (!updatedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({
      _id: updatedAdmin._id,
      name: updatedAdmin.name,
      email: updatedAdmin.email,
      role: updatedAdmin.role,
      universityId: updatedAdmin.universityId
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const changeAdminPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.admin?._id;

    if (!adminId) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await Admin.findByIdAndUpdate(adminId, { password: hashedPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
