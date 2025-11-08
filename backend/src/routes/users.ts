import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  updateRoommatePreferences,
  updateStudyPreferences,
} from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/:id', getUserProfile);
router.put('/:id', updateUserProfile);
router.put('/:id/roommate-preferences', updateRoommatePreferences);
router.put('/:id/study-preferences', updateStudyPreferences);

export default router;