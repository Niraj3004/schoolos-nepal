import { Router } from 'express';
import { createExam, getExams, submitBulkMarks, getReportCard, getExamMarks } from './exam.controller';
import { validate } from '../../middlewares/validate';
import { createExamSchema, bulkMarkEntrySchema } from './exam.validation';
import { authenticate } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/requireRole';
import { requireTenant } from '../../middlewares/tenant';
import { requireActiveTenant } from '../../middlewares/tenantActive';
import { asyncErrorHandler } from '../../utils/asyncErrorHandler';

const router = Router();

router.use(authenticate, requireTenant, requireActiveTenant);

// Master Exam
router.post('/', requireRole(['ADMIN']), validate(createExamSchema), asyncErrorHandler(createExam));
router.get('/', requireRole(['ADMIN', 'TEACHER', 'STUDENT']), asyncErrorHandler(getExams));

// Marks
router.post('/marks/bulk', requireRole(['ADMIN', 'TEACHER']), validate(bulkMarkEntrySchema), asyncErrorHandler(submitBulkMarks));
router.get('/marks', requireRole(['ADMIN', 'TEACHER']), asyncErrorHandler(getExamMarks));

// Reports
router.get('/report-card/:examId/:studentId', requireRole(['ADMIN', 'TEACHER', 'PARENT', 'STUDENT']), asyncErrorHandler(getReportCard));

export default router;
