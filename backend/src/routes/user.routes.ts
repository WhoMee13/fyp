import express from 'express';
import { body } from 'express-validator';
import {
  getProfile,
  updateProfile,
  changePassword
} from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authenticate);

router.get('/profile', getProfile);
router.put(
  '/profile',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('phone').optional().trim(),
    body('email').optional().isEmail().withMessage('Valid email is required')
  ],
  updateProfile
);
router.put(
  '/change-password',
  [
    body('currentPassword').optional().trim(),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
  ],
  changePassword
);

export default router;

