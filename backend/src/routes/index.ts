import { Router } from 'express';
import authRoutes from '../modules/auth/auth.route';
import tenantRoutes from '../modules/tenant/tenant.route';
import academicRoutes from '../modules/academic/academic.route';
import studentRoutes from '../modules/student/student.route';
import parentRoutes from '../modules/student/parent.route';
import attendanceRoutes from '../modules/attendance/attendance.route';
import examRoutes from '../modules/exam/exam.route';
import homeworkRoutes from '../modules/homework/homework.route';
import financeRoutes from '../modules/finance/finance.route';
import saasRoutes from '../modules/saas/saas.route';
import communicationRoutes from '../modules/communication/communication.route';
import analyticsRoutes from '../modules/analytics/analytics.route';

const router = Router();

router.use('/auth', authRoutes);
router.use('/saas', saasRoutes);
router.use('/tenant', tenantRoutes);
router.use('/academic', academicRoutes);
router.use('/students', studentRoutes);
router.use('/parents', parentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/exams', examRoutes);
router.use('/homework', homeworkRoutes);
router.use('/finance', financeRoutes);
router.use('/communication', communicationRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
