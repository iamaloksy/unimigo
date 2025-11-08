import express from 'express';
import {
  createRoommatePost,
  getRoommatePosts,
  getRoommatePost,
  updateRoommatePost,
  deleteRoommatePost,
  matchRoommates,
} from '../controllers/roommateController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.post('/posts', createRoommatePost);
router.get('/posts', getRoommatePosts);
router.get('/posts/:id', getRoommatePost);
router.put('/posts/:id', updateRoommatePost);
router.delete('/posts/:id', deleteRoommatePost);
router.post('/match', matchRoommates);

export default router;