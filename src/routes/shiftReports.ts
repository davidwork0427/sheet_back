import { Router } from 'express';
import {
  createShiftReport,
  submitShiftReport,
  getShiftReports,
  getShiftReport,
  getDailyReports,
  getMyReports,
  checkEditPermission,
} from '../controllers/shiftReportController';
// import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// TODO: Enable authentication when ready
// router.use(authenticateToken);

// Employee endpoints - restricted to own data
router.get('/my-reports', getMyReports); // Employees see only their own
router.get('/:id/can-edit', checkEditPermission); // Check if can edit

// General endpoints - filtered by role
router.get('/', getShiftReports); // Auto-filtered by role
router.get('/daily/:date', getDailyReports); // Managers/admins see all, employees filtered
router.get('/:id', getShiftReport); // Auto-filtered by role

// Create and submit - all authenticated users
router.post('/', createShiftReport); // Permission checks inside
router.post('/:id/submit', submitShiftReport); // Permission checks inside

export default router;
