import express from 'express';
import { body } from 'express-validator';
import { register, login, logout, getMe, forgotPassword, googleAuth } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').optional().trim()
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  login
);

router.post(
  '/google',
  [body('credential').notEmpty().withMessage('Google credential is required')],
  googleAuth
);

router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.post('/forgot-password', forgotPassword);

export default router;

