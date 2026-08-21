import { Router } from 'express';
import { createExam, getExams, submitBulkMarks, getReportCard } from './exam.controller';
import { validate } from '../../middlewares/validate';
import { createExamSchema, bulkMarkEntrySchema } from './exam.validation';
import { authenticate } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/requireRole';
import { requireTenant } from '../../middlewares/tenant';
import { asyncErrorHandler } from '../../utils/asyncErrorHandler';

const router = Router();

router.use(authenticate, requireTenant);

// Master Exam
router.post('/', requireRole(['ADMIN']), validate(createExamSchema), asyncErrorHandler(createExam));
router.get('/', requireRole(['ADMIN', 'TEACHER', 'STUDENT']), asyncErrorHandler(getExams));

// Marks
router.post('/marks/bulk', requireRole(['ADMIN', 'TEACHER']), validate(bulkMarkEntrySchema), asyncErrorHandler(submitBulkMarks));

// Reports
router.get('/report-card/:examId/:studentId', requireRole(['ADMIN', 'TEACHER', 'PARENT', 'STUDENT']), asyncErrorHandler(getReportCard));

export default router;
