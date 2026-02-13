import express from 'express';
import { query } from 'express-validator';
import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getUserProperties,
  contactOwner,
  getNearbyProperties
} from '../controllers/property.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadMultiple } from '../config/multer.config';

const router = express.Router();

// Public routes
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('city').optional().trim(),
    query('propertyType').optional().isIn(['Residential', 'Agricultural', 'Commercial']),
    query('purpose').optional().isIn(['Sale', 'Rent']),
    query('minPrice').optional().isFloat({ min: 0 }),
    query('maxPrice').optional().isFloat({ min: 0 })
  ],
  getProperties
);

router.get(
  '/nearby',
  [
    query('lat').exists().isFloat().withMessage('lat is required and must be a number'),
    query('lng').exists().isFloat().withMessage('lng is required and must be a number'),
    query('radiusKm').optional().isFloat({ min: 1 }).withMessage('radiusKm must be a positive number'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50')
  ],
  getNearbyProperties
);

router.get('/:id', getPropertyById);

// Protected routes
router.post('/', authenticate, uploadMultiple, createProperty);
router.get('/user/my-properties', authenticate, getUserProperties);
router.put('/:id', authenticate, uploadMultiple, updateProperty);
router.delete('/:id', authenticate, deleteProperty);
router.post('/:id/contact', authenticate, contactOwner);

export default router;

