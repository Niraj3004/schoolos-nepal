import { Router } from 'express';
import { 
  createClass, 
  getClasses, 
  createSection, 
  getSections,
  updateSection, 
  createSubject, 
  getSubjects, 
  allocateSubject, 
  getAllocations,
  getMyClasses,
  createAcademicYear,
  getAcademicYears,
  activateAcademicYear,
  createTerm,
  getTerms
} from './academic.controller';
import { validate } from '../../middlewares/validate';
import { 
  createClassSchema, 
  createSectionSchema, 
  updateSectionSchema, 
  createSubjectSchema, 
  allocateSubjectSchema,
  createAcademicYearSchema,
  createTermSchema
} from './academic.validation';
import { authenticate } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/requireRole';
import { requireTenant } from '../../middlewares/tenant';
import { requireActiveTenant } from '../../middlewares/tenantActive';
import { asyncErrorHandler } from '../../utils/asyncErrorHandler';


const router = Router();

router.use(authenticate, requireTenant, requireActiveTenant);

// Academic Years
router.post('/academic-years', requireRole(['ADMIN']), validate(createAcademicYearSchema), asyncErrorHandler(createAcademicYear));
router.get('/academic-years', requireRole(['ADMIN', 'TEACHER', 'STUDENT']), asyncErrorHandler(getAcademicYears));
router.patch('/academic-years/:id/activate', requireRole(['ADMIN']), asyncErrorHandler(activateAcademicYear));

// Terms
router.post('/terms', requireRole(['ADMIN']), validate(createTermSchema), asyncErrorHandler(createTerm));
router.get('/terms', requireRole(['ADMIN', 'TEACHER', 'STUDENT']), asyncErrorHandler(getTerms));

// Classes
router.post('/classes', requireRole(['ADMIN']), validate(createClassSchema), asyncErrorHandler(createClass));
router.get('/classes', requireRole(['ADMIN', 'TEACHER', 'STUDENT']), asyncErrorHandler(getClasses));

// Sections
router.post('/sections', requireRole(['ADMIN']), validate(createSectionSchema), asyncErrorHandler(createSection));
router.get('/sections', requireRole(['ADMIN', 'TEACHER', 'STUDENT']), asyncErrorHandler(getSections));
router.patch('/sections/:id', requireRole(['ADMIN']), validate(updateSectionSchema), asyncErrorHandler(updateSection));

// Subjects
router.post('/subjects', requireRole(['ADMIN']), validate(createSubjectSchema), asyncErrorHandler(createSubject));
router.get('/subjects', requireRole(['ADMIN', 'TEACHER', 'STUDENT']), asyncErrorHandler(getSubjects));

// Allocations
router.post('/allocations', requireRole(['ADMIN']), validate(allocateSubjectSchema), asyncErrorHandler(allocateSubject));
router.get('/allocations', requireRole(['ADMIN']), asyncErrorHandler(getAllocations));
router.get('/allocations/my-classes', requireRole(['TEACHER']), asyncErrorHandler(getMyClasses));

export default router;
