import { Router } from 'express';
import {
  getDashboardOverview,
  getRecentSubmissions,
  getMissingReports,
} from '../controllers/dashboardController';

const router = Router();

router.get('/overview', getDashboardOverview);
router.get('/recent-submissions', getRecentSubmissions);
router.get('/missing-reports', getMissingReports);

export default router;
