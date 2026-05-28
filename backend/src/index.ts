import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { apiLogger } from './middleware/logger';
import authRoutes from './routes/auth.routes';
import propertyRoutes from './routes/property.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import geoRoutes from './routes/geo.routes';
import vendorRoutes from './routes/vendor.routes';
import bookingRoutes from './routes/booking.routes';
import siteSettingsRoutes from './routes/siteSettings.routes';
import { PrismaClient } from '@prisma/client';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, '../public')));

// API Logger middleware
app.use(apiLogger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/geo', geoRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/settings', siteSettingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});
const prisma = new PrismaClient()
// In src/index.ts or a test controller
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT NOW() as current_time`;
    res.json({
      success: true,
      message: "✅ Database connected successfully",
      time: result
    });
  } catch (error: any) {
    console.error("DB Test Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      meta: error.meta
    });
  }
});

// Global error handling middleware (must be registered after all routes and handlers)
app.use(errorHandler);

// Process-level exception listeners to prevent server crashes
process.on('uncaughtException', (error) => {
  console.error('CRITICAL: Uncaught Exception occurred:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL: Unhandled Promise Rejection at:', promise, 'reason:', reason);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;