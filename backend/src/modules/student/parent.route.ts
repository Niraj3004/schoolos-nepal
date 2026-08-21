import { Router } from 'express';
import { getMyChildren } from './parent.controller';
import { authenticate } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/requireRole';
import { requireTenant } from '../../middlewares/tenant';
import { asyncErrorHandler } from '../../utils/asyncErrorHandler';

const router = Router();

router.use(authenticate, requireTenant);

router.get('/my-children', requireRole(['PARENT']), asyncErrorHandler(getMyChildren));

export default router;
