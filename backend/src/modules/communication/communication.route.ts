import { Router } from 'express';
import { 
  createNotice, getNotices, 
  createEvent, getEvents, 
  getNotifications, markRead, markAllRead,
  sendFeeReminders, sendAbsenceReminders
} from './communication.controller';
import { validate } from '../../middlewares/validate';
import { createNoticeSchema, createEventSchema } from './communication.validation';
import { authenticate } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/requireRole';
import { requireTenant } from '../../middlewares/tenant';
import { requireActiveTenant } from '../../middlewares/tenantActive';
import { upload } from '../../middlewares/upload';
import { asyncErrorHandler } from '../../utils/asyncErrorHandler';

const router = Router();

router.use(authenticate, requireTenant, requireActiveTenant);

// --- NOTICES ---
router.post('/notices', requireRole(['ADMIN', 'TEACHER']), upload.single('attachment'), validate(createNoticeSchema), asyncErrorHandler(createNotice));
router.get('/notices', asyncErrorHandler(getNotices)); // All authenticated users can view (filtered internally)

// --- EVENTS ---
router.post('/events', requireRole(['ADMIN']), validate(createEventSchema), asyncErrorHandler(createEvent));
router.get('/events', asyncErrorHandler(getEvents));

// --- NOTIFICATIONS ---
router.get('/notifications', asyncErrorHandler(getNotifications));
router.patch('/notifications/mark-all-read', asyncErrorHandler(markAllRead));
router.patch('/notifications/:id/read', asyncErrorHandler(markRead));

router.post('/reminders/fees', requireRole(['ADMIN']), asyncErrorHandler(sendFeeReminders));
router.post('/reminders/absences', requireRole(['ADMIN']), asyncErrorHandler(sendAbsenceReminders));

export default router;
