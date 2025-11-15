import express from 'express';
import {
  createMarketplaceItem,
  getMarketplaceItems,
  getMarketplaceItem,
  updateMarketplaceItem,
  deleteMarketplaceItem,
} from '../controllers/marketplaceController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.post('/items', createMarketplaceItem);
router.get('/items', getMarketplaceItems);
router.get('/items/:id', getMarketplaceItem);
router.put('/items/:id', updateMarketplaceItem);
router.delete('/items/:id', deleteMarketplaceItem);

export default router;
