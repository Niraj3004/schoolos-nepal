import { Router } from 'express';
import authRoutes from '../modules/auth/auth.route';
import tenantRoutes from '../modules/tenant/tenant.route';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tenant', tenantRoutes);

export default router;
