import { Router } from 'express';
import { 
  getSettings, 
  updateSettings, 
  createAcademicYear, 
  setCurrentAcademicYear, 
  createTerm, 
  createHouse, 
  getHouses 
} from './tenant.controller';
import { validate } from '../../middlewares/validate';
import { updateTenantSchema, createAcademicYearSchema, createTermSchema, createHouseSchema } from './tenant.validation';
import { authenticate } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/requireRole';
import { requireTenant } from '../../middlewares/tenant';
import { requireActiveTenant } from '../../middlewares/tenantActive';
import { upload } from '../../middlewares/upload';
import { asyncErrorHandler } from '../../utils/asyncErrorHandler';

const router = Router();

// All tenant settings require authentication and tenant context
router.use(authenticate, requireTenant, requireActiveTenant);

router.get('/settings', requireRole(['ADMIN', 'TEACHER']), asyncErrorHandler(getSettings));
router.patch('/settings', requireRole(['ADMIN']), upload.single('logo'), validate(updateTenantSchema), asyncErrorHandler(updateSettings));

router.post('/academic-years', requireRole(['ADMIN']), validate(createAcademicYearSchema), asyncErrorHandler(createAcademicYear));
router.patch('/academic-years/:id/set-current', requireRole(['ADMIN']), asyncErrorHandler(setCurrentAcademicYear));

router.post('/terms', requireRole(['ADMIN']), validate(createTermSchema), asyncErrorHandler(createTerm));

router.post('/houses', requireRole(['ADMIN']), validate(createHouseSchema), asyncErrorHandler(createHouse));
router.get('/houses', requireRole(['ADMIN', 'TEACHER']), asyncErrorHandler(getHouses));

export default router;
