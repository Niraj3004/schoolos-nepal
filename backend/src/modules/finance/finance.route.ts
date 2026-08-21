import { Router } from 'express';
import { createFeeHead, createFeeStructure, generateMonthlyInvoices, uploadSlip, getPendingSlips, verifySlip } from './finance.controller';
import { validate } from '../../middlewares/validate';
import { createFeeHeadSchema, createFeeStructureSchema, generateMonthlyInvoicesSchema, verifySlipSchema } from './finance.validation';
import { authenticate } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/requireRole';
import { requireTenant } from '../../middlewares/tenant';
import { requireActiveTenant } from '../../middlewares/tenantActive';
import { asyncErrorHandler } from '../../utils/asyncErrorHandler';
import { upload } from '../../middlewares/upload';

const router = Router();

router.use(authenticate, requireTenant, requireActiveTenant);

// Setup
router.post('/fee-heads', requireRole(['ADMIN']), validate(createFeeHeadSchema), asyncErrorHandler(createFeeHead));
router.post('/fee-structures', requireRole(['ADMIN']), validate(createFeeStructureSchema), asyncErrorHandler(createFeeStructure));

// Invoices
router.post('/invoices/generate-monthly', requireRole(['ADMIN']), validate(generateMonthlyInvoicesSchema), asyncErrorHandler(generateMonthlyInvoices));

// Slips workflow
router.post('/invoices/:id/upload-slip', requireRole(['PARENT']), upload.single('receipt'), asyncErrorHandler(uploadSlip));
router.get('/slips/pending', requireRole(['ADMIN']), asyncErrorHandler(getPendingSlips));
router.patch('/slips/:id/verify', requireRole(['ADMIN']), validate(verifySlipSchema), asyncErrorHandler(verifySlip));

export default router;
