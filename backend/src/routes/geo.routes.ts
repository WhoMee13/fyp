import express from 'express';
import { query } from 'express-validator';
import { reverseGeocode } from '../controllers/geo.controller';

const router = express.Router();

router.get(
  '/reverse',
  [
    query('lat').exists().isFloat().withMessage('lat is required and must be a number'),
    query('lng').exists().isFloat().withMessage('lng is required and must be a number'),
  ],
  reverseGeocode
);

export default router;


