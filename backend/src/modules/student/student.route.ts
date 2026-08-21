import { Router } from 'express';
import { enrollStudent, bulkEnroll, getStudents, getStudentById } from './student.controller';
import { validate } from '../../middlewares/validate';
import { enrollStudentSchema, bulkEnrollSchema } from './student.validation';
import { authenticate } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/requireRole';
import { requireTenant } from '../../middlewares/tenant';
import { upload } from '../../middlewares/upload';
import { asyncErrorHandler } from '../../utils/asyncErrorHandler';

const router = Router();

router.use(authenticate, requireTenant);

router.post('/enroll', requireRole(['ADMIN']), upload.single('avatar'), validate(enrollStudentSchema), asyncErrorHandler(enrollStudent));
router.post('/bulk-enroll', requireRole(['ADMIN']), validate(bulkEnrollSchema), asyncErrorHandler(bulkEnroll));

router.get('/', requireRole(['ADMIN', 'TEACHER']), asyncErrorHandler(getStudents));
router.get('/:id', requireRole(['ADMIN', 'TEACHER', 'STUDENT']), asyncErrorHandler(getStudentById));

export default router;
