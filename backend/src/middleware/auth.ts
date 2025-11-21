import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import Admin from '../models/Admin';
import University from '../models/University';

export interface AuthRequest extends Request {
  user?: IUser;
  admin?: any;
  universityId?: string;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required', logout: true });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await User.findById(decoded.userId).populate('universityId');

    if (!user) {
      return res.status(401).json({ error: 'User not found', logout: true });
    }

    // Check token version
    const userVersion = user.tokenVersion || 0;
    const tokenVersion = decoded.tokenVersion || 0;
    if (tokenVersion !== userVersion) {
      return res.status(401).json({ error: 'Token invalidated', logout: true });
    }

    req.user = user;
    req.universityId = user.universityId.toString();
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token', logout: true });
  }
};

export const authenticateAdminToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    if (!decoded.adminId) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const admin = await Admin.findById(decoded.adminId);

    if (!admin) {
      return res.status(401).json({ error: 'Admin not found' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const universityIsolation = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.universityId) {
    return res.status(403).json({ error: 'University access required' });
  }
  next();
};
