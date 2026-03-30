import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { applyForVendor, getMyVendorProfile, cancelMyVendorApplication, vendorUploadMiddleware } from '../controllers/vendor.controller';

const router = express.Router();

router.post('/apply', authenticate, vendorUploadMiddleware, applyForVendor);
router.post('/cancel', authenticate, cancelMyVendorApplication);
router.get('/me', authenticate, getMyVendorProfile);

export default router;

