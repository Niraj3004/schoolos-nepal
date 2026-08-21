import { Router } from 'express';
import { 
  createClass, 
  getClasses, 
  createSection, 
  updateSection, 
  createSubject, 
  getSubjects, 
  allocateSubject, 
  getMyClasses 
} from './academic.controller';
import { validate } from '../../middlewares/validate';
import { 
  createClassSchema, 
  createSectionSchema, 
  updateSectionSchema, 
  createSubjectSchema, 
  allocateSubjectSchema 
} from './academic.validation';
import { authenticate } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/requireRole';
import { requireTenant } from '../../middlewares/tenant';
import { requireActiveTenant } from '../../middlewares/tenantActive';
import { asyncErrorHandler } from '../../utils/asyncErrorHandler';

const router = Router();

router.use(authenticate, requireTenant, requireActiveTenant);

// Classes
router.post('/classes', requireRole(['ADMIN']), validate(createClassSchema), asyncErrorHandler(createClass));
router.get('/classes', requireRole(['ADMIN', 'TEACHER', 'STUDENT']), asyncErrorHandler(getClasses));

// Sections
router.post('/sections', requireRole(['ADMIN']), validate(createSectionSchema), asyncErrorHandler(createSection));
router.patch('/sections/:id', requireRole(['ADMIN']), validate(updateSectionSchema), asyncErrorHandler(updateSection));

// Subjects
router.post('/subjects', requireRole(['ADMIN']), validate(createSubjectSchema), asyncErrorHandler(createSubject));
router.get('/subjects', requireRole(['ADMIN', 'TEACHER', 'STUDENT']), asyncErrorHandler(getSubjects));

// Allocations
router.post('/allocations', requireRole(['ADMIN']), validate(allocateSubjectSchema), asyncErrorHandler(allocateSubject));
router.get('/allocations/my-classes', requireRole(['TEACHER']), asyncErrorHandler(getMyClasses));

export default router;
