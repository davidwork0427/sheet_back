import { Router } from 'express';
import {
  getDailyAggregate,
  getMonthlyAggregate,
  getEmployeeTotal,
  getAllEmployeeTotalsHandler,
} from '../controllers/aggregateController';

const router = Router();

router.get('/daily/:date', getDailyAggregate);
router.get('/month/:year/:month', getMonthlyAggregate);
router.get('/employee-totals/:employeeId', getEmployeeTotal);
router.get('/employee-totals', getAllEmployeeTotalsHandler);

export default router;
