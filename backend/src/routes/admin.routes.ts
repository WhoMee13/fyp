import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  getAllProperties,
  approveProperty,
  rejectProperty,
  deleteProperty as adminDeleteProperty,
  getReports,
  getVendorApplications,
  approveVendorApplication,
  rejectVendorApplication
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/role', updateUserRole);
router.get('/vendors', getVendorApplications);
router.put('/vendors/:id/approve', approveVendorApplication);
router.put('/vendors/:id/reject', rejectVendorApplication);
router.get('/properties', getAllProperties);
router.put('/properties/:id/approve', approveProperty);
router.put('/properties/:id/reject', rejectProperty);
router.delete('/properties/:id', adminDeleteProperty);
router.get('/reports', getReports);

export default router;

