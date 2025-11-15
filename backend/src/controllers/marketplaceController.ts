import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import MarketplaceItem from '../models/MarketplaceItem';

// Create marketplace item
export const createMarketplaceItem = async (req: AuthRequest, res: Response) => {
  try {
    const itemData = {
      ...req.body,
      sellerId: req.user._id,
      universityId: req.universityId,
    };

    const item = await MarketplaceItem.create(itemData);
    const populatedItem = await MarketplaceItem.findById(item._id)
      .populate('sellerId', 'name email profileImage trustScore')
      .populate('universityId', 'name');

    return res.status(201).json({ item: populatedItem });
  } catch (error) {
    console.error('Create marketplace item error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all marketplace items
export const getMarketplaceItems = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      minPrice, 
      maxPrice, 
      category, 
      condition,
      available,
      page = 1,
      limit = 20 
    } = req.query;

    const query: any = { universityId: req.universityId };

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (category) query.category = category;
    if (condition) query.condition = condition;
    if (available !== undefined) query.available = available === 'true';

    const items = await MarketplaceItem.find(query)
      .populate('sellerId', 'name email profileImage trustScore')
      .populate('universityId', 'name')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await MarketplaceItem.countDocuments(query);

    return res.json({
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get marketplace items error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single marketplace item
export const getMarketplaceItem = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const item = await MarketplaceItem.findById(id)
      .populate('sellerId', 'name email profileImage trustScore')
      .populate('universityId', 'name');

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    return res.json({ item });
  } catch (error) {
    console.error('Get marketplace item error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Update marketplace item
export const updateMarketplaceItem = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const item = await MarketplaceItem.findById(id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (item.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updatedItem = await MarketplaceItem.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('sellerId', 'name email profileImage trustScore')
      .populate('universityId', 'name');

    return res.json({ item: updatedItem });
  } catch (error) {
    console.error('Update marketplace item error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete marketplace item
export const deleteMarketplaceItem = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const item = await MarketplaceItem.findById(id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (item.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await MarketplaceItem.findByIdAndDelete(id);
    return res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete marketplace item error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
