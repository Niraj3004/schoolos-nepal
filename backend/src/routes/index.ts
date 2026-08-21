import { Router } from 'express';
import authRoutes from '../modules/auth/auth.route';
import tenantRoutes from '../modules/tenant/tenant.route';
import academicRoutes from '../modules/academic/academic.route';
import studentRoutes from '../modules/student/student.route';
import parentRoutes from '../modules/student/parent.route';
import attendanceRoutes from '../modules/attendance/attendance.route';
import examRoutes from '../modules/exam/exam.route';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tenant', tenantRoutes);
router.use('/academic', academicRoutes);
router.use('/students', studentRoutes);
router.use('/parents', parentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/exams', examRoutes);

export default router;
