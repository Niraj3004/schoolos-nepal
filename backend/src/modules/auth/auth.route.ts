import { Router } from 'express';
import { login, refresh, logout, getMe } from './auth.controller';
import { validate } from '../../middlewares/validate';
import { loginSchema } from './auth.validation';
import { authenticate } from '../../middlewares/auth';
import { asyncErrorHandler } from '../../utils/asyncErrorHandler';
import rateLimit from 'express-rate-limit';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: 'Too many login attempts, please try again later'
});

router.post('/login', loginLimiter, validate(loginSchema), asyncErrorHandler(login));
router.post('/refresh', asyncErrorHandler(refresh));
router.post('/logout', asyncErrorHandler(logout));
router.get('/me', authenticate, asyncErrorHandler(getMe));

export default router;
