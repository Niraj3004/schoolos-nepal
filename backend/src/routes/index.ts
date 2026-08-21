import { Router } from 'express';
import authRoutes from '../modules/auth/auth.route';
import tenantRoutes from '../modules/tenant/tenant.route';
import academicRoutes from '../modules/academic/academic.route';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tenant', tenantRoutes);
router.use('/academic', academicRoutes);

export default router;
