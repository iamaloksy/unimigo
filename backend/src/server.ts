import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import roommateRoutes from './routes/roommate';
import marketplaceRoutes from './routes/marketplace';
import adminRoutes from './routes/admin';
import universitiesRoutes from './routes/universities';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 8001;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'UNIMIGO API is running',
    version: '1.0.0',
    status: 'healthy'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roommate', roommateRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/universities', universitiesRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    
    // Check expired subscriptions every hour
    const { checkExpiredSubscriptions } = require('./controllers/adminController');
    checkExpiredSubscriptions();
    setInterval(checkExpiredSubscriptions, 60 * 60 * 1000);
    
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ Server accessible at http://192.168.217.1:${PORT}`);
      console.log(`✅ Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
