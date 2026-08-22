import { Router } from 'express';
import { enrollStudent, bulkEnroll, getStudents, getStudentById, updateStudent, updateStudentStatus, getStudentMe } from './student.controller';
import { validate } from '../../middlewares/validate';
import { enrollStudentSchema, bulkEnrollSchema, updateStudentSchema, updateStudentStatusSchema } from './student.validation';
import { authenticate } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/requireRole';
import { requireTenant } from '../../middlewares/tenant';
import { requireActiveTenant } from '../../middlewares/tenantActive';
import { upload } from '../../middlewares/upload';
import { asyncErrorHandler } from '../../utils/asyncErrorHandler';

const router = Router();

router.use(authenticate, requireTenant, requireActiveTenant);

router.post('/enroll', requireRole(['ADMIN']), upload.single('avatar'), validate(enrollStudentSchema), asyncErrorHandler(enrollStudent));
router.post('/bulk-enroll', requireRole(['ADMIN']), validate(bulkEnrollSchema), asyncErrorHandler(bulkEnroll));

router.get('/', requireRole(['ADMIN', 'TEACHER']), asyncErrorHandler(getStudents));
router.get('/me', requireRole(['STUDENT']), asyncErrorHandler(getStudentMe));
router.get('/:id', requireRole(['ADMIN', 'TEACHER', 'STUDENT']), asyncErrorHandler(getStudentById));
router.patch('/:id', requireRole(['ADMIN']), upload.single('avatar'), validate(updateStudentSchema), asyncErrorHandler(updateStudent));
router.patch('/:id/status', requireRole(['ADMIN']), validate(updateStudentStatusSchema), asyncErrorHandler(updateStudentStatus));

export default router;

