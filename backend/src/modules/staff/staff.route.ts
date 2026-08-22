import { Router } from 'express';
import { getTeachers, createTeacher, getTeacherById, updateTeacher } from './staff.controller';
import { validate } from '../../middlewares/validate';
import { createTeacherSchema, updateTeacherSchema } from './staff.validation';
import { authenticate } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/requireRole';
import { requireTenant } from '../../middlewares/tenant';
import { requireActiveTenant } from '../../middlewares/tenantActive';
import { asyncErrorHandler } from '../../utils/asyncErrorHandler';

const router = Router();

router.use(authenticate, requireTenant, requireActiveTenant);

// Teachers
router.get('/teachers', requireRole(['ADMIN', 'TEACHER']), asyncErrorHandler(getTeachers));
router.post('/teachers', requireRole(['ADMIN']), validate(createTeacherSchema), asyncErrorHandler(createTeacher));
router.get('/teachers/:id', requireRole(['ADMIN', 'TEACHER']), asyncErrorHandler(getTeacherById));
router.patch('/teachers/:id', requireRole(['ADMIN']), validate(updateTeacherSchema), asyncErrorHandler(updateTeacher));

export default router;
