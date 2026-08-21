import { Router } from 'express';
import { login, refresh, logout, getMe } from './auth.controller';
import { validate } from '../../middlewares/validate';
import { loginSchema } from './auth.validation';
import { authenticate } from '../../middlewares/auth';
import { asyncErrorHandler } from '../../utils/asyncErrorHandler';

const router = Router();

router.post('/login', validate(loginSchema), asyncErrorHandler(login));
router.post('/refresh', asyncErrorHandler(refresh));
router.post('/logout', asyncErrorHandler(logout));
router.get('/me', authenticate, asyncErrorHandler(getMe));

export default router;
