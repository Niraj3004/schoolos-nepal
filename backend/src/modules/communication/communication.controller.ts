import { Request, Response } from 'express';
import { Notice, CalendarEvent, AppNotification } from './communication.model';
import { AcademicYear } from '../academic/academicYear.model';
import { Student } from '../student/student.model';
import { sanitizeRichText } from '../../utils/sanitize';
import { uploadToCloudinary } from '../../utils/cloudinaryStream';
import { successResponse, errorResponse } from '../../utils/response';
import mongoose from 'mongoose';

// --- NOTICES ---
export const createNotice = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const postedBy = req.user?.userId;
  const { title, content, targetAudience, targetClassIds, isUrgent, expiresAtBS } = req.body;

  const currentYear = await AcademicYear.findOne({ schoolId, isCurrent: true });
  if (!currentYear) return errorResponse(res, 'BAD_REQUEST', 'No active academic year found', null, 400);

  const sanitizedContent = sanitizeRichText(content);

  let attachmentUrl;
  if (req.file) {
    const uploadResult = await uploadToCloudinary(req.file.buffer, 'schoolos/notices');
    attachmentUrl = uploadResult.secure_url;
  }

  const notice = await Notice.create({
    schoolId,
    academicYearId: currentYear._id,
    title,
    content: sanitizedContent,
    attachmentUrl,
    targetAudience,
    targetClassIds: targetClassIds || [],
    postedBy,
    isUrgent: isUrgent || false,
    expiresAtBS
  });

  return successResponse(res, notice, 'Notice published successfully', 201);
};

export const getNotices = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const role = req.user?.role;
  const userId = req.user?.userId;
  const { page = 1, limit = 10 } = req.query;

  const currentYear = await AcademicYear.findOne({ schoolId, isCurrent: true });
  if (!currentYear) return errorResponse(res, 'BAD_REQUEST', 'No active academic year found', null, 400);

  const query: any = { schoolId, academicYearId: currentYear._id };

  if (role === 'STUDENT') {
    const student = await Student.findOne({ userId, schoolId });
    if (!student) return errorResponse(res, 'NOT_FOUND', 'Student profile not found', null, 404);

    query.$or = [
      { targetAudience: 'ALL' },
      { targetAudience: 'STUDENTS' },
      { 
        targetAudience: 'GRADE_SPECIFIC',
        targetClassIds: student.currentClassId
      }
    ];
  } else if (role === 'PARENT') {
    query.$or = [
      { targetAudience: 'ALL' },
      { targetAudience: 'PARENTS' }
    ];
  } else if (role === 'TEACHER') {
    query.$or = [
      { targetAudience: 'ALL' },
      { targetAudience: 'TEACHERS' }
    ];
  }
  // ADMIN sees everything (no $or filters added)

  const notices = await Notice.find(query)
    .populate('postedBy', 'name email role')
    .sort({ isUrgent: -1, createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  const total = await Notice.countDocuments(query);

  return successResponse(res, { notices, total, page: Number(page) }, 'Notices retrieved');
};


// --- CALENDAR EVENTS ---
export const createEvent = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const data = { ...req.body, schoolId };

  const currentYear = await AcademicYear.findOne({ schoolId, isCurrent: true });
  if (!currentYear) return errorResponse(res, 'BAD_REQUEST', 'No active academic year found', null, 400);
  
  data.academicYearId = currentYear._id;

  const event = await CalendarEvent.create(data);
  return successResponse(res, event, 'Calendar event created', 201);
};

export const getEvents = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const { monthBS } = req.query; // e.g. "2083-05"

  const currentYear = await AcademicYear.findOne({ schoolId, isCurrent: true });
  if (!currentYear) return errorResponse(res, 'BAD_REQUEST', 'No active academic year found', null, 400);

  const query: any = { schoolId, academicYearId: currentYear._id };
  
  if (monthBS) {
    query.startDateBS = { $regex: `^${monthBS}` }; // Prefix match for month
  }

  const events = await CalendarEvent.find(query).sort({ startDateAD: 1 });
  return successResponse(res, events, 'Calendar events retrieved');
};


// --- NOTIFICATIONS ---
export const getNotifications = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const recipientUserId = req.user?.userId;
  const { page = 1, limit = 20 } = req.query;

  const notifications = await AppNotification.find({ schoolId, recipientUserId })
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  const total = await AppNotification.countDocuments({ schoolId, recipientUserId });
  const unreadCount = await AppNotification.countDocuments({ schoolId, recipientUserId, isRead: false });

  return successResponse(res, { notifications, unreadCount, total, page: Number(page) }, 'Notifications retrieved');
};

export const markRead = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const recipientUserId = req.user?.userId;
  const { id } = req.params;

  const notification = await AppNotification.findOneAndUpdate(
    { _id: id, schoolId, recipientUserId },
    { isRead: true },
    { new: true }
  );

  if (!notification) return errorResponse(res, 'NOT_FOUND', 'Notification not found', null, 404);

  return successResponse(res, notification, 'Notification marked as read');
};

export const markAllRead = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const recipientUserId = req.user?.userId;

  await AppNotification.updateMany(
    { schoolId, recipientUserId, isRead: false },
    { isRead: true }
  );

  return successResponse(res, null, 'All notifications marked as read');
};
