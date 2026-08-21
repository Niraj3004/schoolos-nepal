import { Router } from 'express';
import authRoutes from '../modules/auth/auth.route';
import tenantRoutes from '../modules/tenant/tenant.route';
import academicRoutes from '../modules/academic/academic.route';
import studentRoutes from '../modules/student/student.route';
import parentRoutes from '../modules/student/parent.route';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tenant', tenantRoutes);
router.use('/academic', academicRoutes);
router.use('/students', studentRoutes);
router.use('/parents', parentRoutes);

export default router;
