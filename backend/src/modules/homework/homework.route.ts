import { Router } from 'express';
import { createHomework, getClassHomework, deleteHomework, submitHomework, evaluateSubmission } from './homework.controller';
import { createMaterial, getMaterials, deleteMaterial } from './material.controller';
import { validate } from '../../middlewares/validate';
import { createHomeworkSchema, evaluateSubmissionSchema, createMaterialSchema } from './homework.validation';
import { authenticate } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/requireRole';
import { requireTenant } from '../../middlewares/tenant';
import { asyncErrorHandler } from '../../utils/asyncErrorHandler';
import upload from '../../middlewares/upload';

const router = Router();

router.use(authenticate, requireTenant);

// Homework Master
router.post('/', requireRole(['ADMIN', 'TEACHER']), upload.array('attachments', 5), validate(createHomeworkSchema), asyncErrorHandler(createHomework));
router.get('/class', requireRole(['ADMIN', 'TEACHER', 'STUDENT']), asyncErrorHandler(getClassHomework));
router.delete('/:id', requireRole(['ADMIN', 'TEACHER']), asyncErrorHandler(deleteHomework));

// Submissions
router.post('/:id/submit', requireRole(['STUDENT']), upload.array('files', 5), asyncErrorHandler(submitHomework));
router.patch('/submissions/:id/evaluate', requireRole(['TEACHER', 'ADMIN']), validate(evaluateSubmissionSchema), asyncErrorHandler(evaluateSubmission));

// Learning Materials
router.post('/materials', requireRole(['ADMIN', 'TEACHER']), upload.single('file'), validate(createMaterialSchema), asyncErrorHandler(createMaterial));
router.get('/materials', requireRole(['ADMIN', 'TEACHER', 'STUDENT']), asyncErrorHandler(getMaterials));
router.delete('/materials/:id', requireRole(['ADMIN', 'TEACHER']), asyncErrorHandler(deleteMaterial));

export default router;
