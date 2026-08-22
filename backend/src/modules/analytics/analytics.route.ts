import { Router } from 'express';
import { getAdminDashboard, getTeacherWorkload, getAuditLogs, getTeacherDashboard } from './analytics.controller';
import { authenticate } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/requireRole';
import { requireTenant } from '../../middlewares/tenant';
import { requireActiveTenant } from '../../middlewares/tenantActive';
import { asyncErrorHandler } from '../../utils/asyncErrorHandler';

const router = Router();

router.use(authenticate, requireTenant, requireActiveTenant);

router.get('/admin-dashboard', requireRole(['ADMIN']), asyncErrorHandler(getAdminDashboard));
router.get('/teacher-workload', requireRole(['ADMIN', 'TEACHER']), asyncErrorHandler(getTeacherWorkload));
router.get('/teacher-dashboard', requireRole(['TEACHER']), asyncErrorHandler(getTeacherDashboard));
router.get('/audit-logs', requireRole(['ADMIN']), asyncErrorHandler(getAuditLogs));

export default router;
