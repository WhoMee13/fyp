import express from 'express';
import { getSettings, updateSettings } from '../controllers/siteSettings.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadLogo } from '../config/multer.config';

const router = express.Router();

// Public route to get settings
router.get('/', getSettings);

// Protected route to update settings (Admin only)
router.put('/', authenticate, uploadLogo, updateSettings);

export default router;
