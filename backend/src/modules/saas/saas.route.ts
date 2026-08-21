import { Router } from 'express';
import { getPlans, getPlatformQr, registerSchool, getAdminRequests, reviewRequest } from './saas.controller';
import { validate } from '../../middlewares/validate';
import { registerSchoolSchema, reviewRequestSchema } from './saas.validation';
import { authenticate } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/requireRole';
import { asyncErrorHandler } from '../../utils/asyncErrorHandler';
import { upload } from '../../middlewares/upload';

const router = Router();

// Public Endpoints
router.get('/plans', asyncErrorHandler(getPlans));
router.get('/platform-qr', asyncErrorHandler(getPlatformQr));
router.post('/register-school', upload.single('receipt'), validate(registerSchoolSchema), asyncErrorHandler(registerSchool));

// SuperAdmin Endpoints (No requireTenant used here to isolate SuperAdmin)
router.use(authenticate, requireRole(['SUPERADMIN']));

router.get('/admin/requests', asyncErrorHandler(getAdminRequests));
router.patch('/admin/requests/:id/approve', validate(reviewRequestSchema), asyncErrorHandler(reviewRequest));
router.patch('/admin/requests/:id/reject', validate(reviewRequestSchema), asyncErrorHandler(reviewRequest));

export default router;
