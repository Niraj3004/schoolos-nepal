import { Router } from 'express';
import { globalSearch } from './search.controller';
import { authenticate } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/requireRole';
import { requireTenant } from '../../middlewares/tenant';
import { requireActiveTenant } from '../../middlewares/tenantActive';
import { asyncErrorHandler } from '../../utils/asyncErrorHandler';

const router = Router();

router.use(authenticate, requireTenant, requireActiveTenant);

// Only Admins and Teachers can use the global search
router.get('/', requireRole(['ADMIN', 'TEACHER']), asyncErrorHandler(globalSearch));

export default router;
