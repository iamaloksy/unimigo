import express from 'express';
import { adminLogin, getStats, getUniversities, getAllUsers, createUniversity, updateUniversity, deleteUniversity, getUniversityStats, getUniversityUsers, getUniversityPosts, updateSubscription, getSettings, updateSettings, getUniversityReports, createReport, updateReportStatus, getReportStats, getRecentReports, getAdminProfile, updateAdminProfile, changeAdminPassword } from '../controllers/adminController';
import { authenticateAdminToken } from '../middleware/auth';

const router = express.Router();

// Public routes (no authentication required)
router.post('/login', adminLogin);

// Protected routes (authentication required)
router.get('/stats', authenticateAdminToken, getStats);
router.get('/universities', authenticateAdminToken, getUniversities);
router.post('/universities', authenticateAdminToken, createUniversity);
router.put('/universities/:id', authenticateAdminToken, updateUniversity);
router.patch('/universities/:id/subscription', authenticateAdminToken, updateSubscription);
router.delete('/universities/:id', authenticateAdminToken, deleteUniversity);
router.get('/users', authenticateAdminToken, getAllUsers);

// University admin routes (require admin authentication)
router.get('/university/:universityId/stats', authenticateAdminToken, getUniversityStats);
router.get('/university/:universityId/users', authenticateAdminToken, getUniversityUsers);
router.get('/university/:universityId/posts', authenticateAdminToken, getUniversityPosts);
router.get('/settings', authenticateAdminToken, getSettings);
router.put('/settings', authenticateAdminToken, updateSettings);

// Report management routes (require admin authentication)
router.get('/university/:universityId/reports', authenticateAdminToken, getUniversityReports);
router.post('/reports', authenticateAdminToken, createReport);
router.put('/reports/:id/status', authenticateAdminToken, updateReportStatus);
router.get('/university/:universityId/report-stats', authenticateAdminToken, getReportStats);
router.get('/university/:universityId/recent-reports', authenticateAdminToken, getRecentReports);

// Admin profile management routes (require admin authentication)
router.get('/profile', authenticateAdminToken, getAdminProfile);
router.put('/profile', authenticateAdminToken, updateAdminProfile);
router.put('/change-password', authenticateAdminToken, changeAdminPassword);

export default router;
