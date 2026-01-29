import { Router } from 'express';
import { register, login, refresh, me, logout } from '../controllers/authController';
import { validate } from '../middleware/validation';
import { registerSchema, loginSchema } from '../utils/validators';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', authenticateToken, requireRole('admin'), validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);

// Protected routes
router.get('/me', authenticateToken, me);

export default router;
