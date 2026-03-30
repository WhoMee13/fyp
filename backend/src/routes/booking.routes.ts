import express from 'express';
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  createBooking,
  getMyBookings,
  getVendorBookings,
  cancelBookingByVendor,
  cancelBookingByCustomer,
  approveBookingByVendor
} from '../controllers/booking.controller';

const router: Router = express.Router();

router.use(authenticate);

router.post('/', createBooking);
router.get('/my', getMyBookings);
router.get('/vendor', getVendorBookings);
router.put('/:id/approve', approveBookingByVendor);
router.put('/:id/cancel-by-vendor', cancelBookingByVendor);
router.put('/:id/cancel-by-customer', cancelBookingByCustomer);

export default router;

