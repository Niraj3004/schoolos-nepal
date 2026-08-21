import { Router } from 'express';
import { submitAttendance, getClassAttendance, getStudentSummary, getMyChildAttendance } from './attendance.controller';
import { validate } from '../../middlewares/validate';
import { submitAttendanceSchema } from './attendance.validation';
import { authenticate } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/requireRole';
import { requireTenant } from '../../middlewares/tenant';
import { requireActiveTenant } from '../../middlewares/tenantActive';
import { asyncErrorHandler } from '../../utils/asyncErrorHandler';

const router = Router();

router.use(authenticate, requireTenant, requireActiveTenant);

router.post('/', requireRole(['ADMIN', 'TEACHER']), validate(submitAttendanceSchema), asyncErrorHandler(submitAttendance));
router.get('/class', requireRole(['ADMIN', 'TEACHER']), asyncErrorHandler(getClassAttendance));
router.get('/student/:studentId', requireRole(['ADMIN', 'TEACHER', 'STUDENT']), asyncErrorHandler(getStudentSummary));
router.get('/my-child/:studentId', requireRole(['PARENT']), asyncErrorHandler(getMyChildAttendance));

export default router;
