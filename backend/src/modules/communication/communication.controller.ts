import { Request, Response } from 'express';
import { Notice, CalendarEvent, AppNotification } from './communication.model';
import { AcademicYear } from '../academic/academicYear.model';
import { Student } from '../student/student.model';
import { sanitizeRichText } from '../../utils/sanitize';
import { uploadToCloudinary } from '../../utils/cloudinaryStream';
import { successResponse, errorResponse } from '../../utils/response';
import mongoose from 'mongoose';
import { StudentInvoice } from '../finance/finance.model';
import { AttendanceRecord } from '../attendance/attendance.model';
import { sendMockEmail } from '../../utils/mailer';
import { emitToUser } from '../../utils/socket';

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

export const sendFeeReminders = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const currentYear = await AcademicYear.findOne({ schoolId, isCurrent: true });
  if (!currentYear) return errorResponse(res, 'BAD_REQUEST', 'No active academic year found', null, 400);

  const pendingInvoices = await StudentInvoice.find({ 
    schoolId, 
    academicYearId: currentYear._id,
    status: { $in: ['UNPAID', 'PARTIALLY_PAID'] }
  }).populate({
    path: 'studentId',
    populate: { path: 'parentId', populate: { path: 'userId' } }
  });

  let sentCount = 0;
  for (const invoice of pendingInvoices) {
    const student: any = invoice.studentId;
    if (student && student.parentId && student.parentId.userId) {
      const parentUser = student.parentId.userId;
      const email = parentUser.email;
      
      const text = `Dear Parent, this is a reminder that fee invoice for ${student.firstName} is pending. Amount due: Rs. ${invoice.totalPayable - invoice.paidAmount}.`;
      await sendMockEmail(email, 'Fee Reminder', text, `<p>${text}</p>`);
      
      const notification = await AppNotification.create({
        schoolId,
        recipientUserId: parentUser._id,
        title: 'Fee Reminder',
        message: text,
        type: 'FEE_DUE'
      });
      
      emitToUser(parentUser._id, 'new_notification', notification);
      sentCount++;
    }
  }

  return successResponse(res, { sentCount }, `Fee reminders sent to ${sentCount} parents.`);
};

export const sendAbsenceReminders = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const todayBS = "2083-05-12"; 
  
  const attendanceRecords = await AttendanceRecord.find({ schoolId, dateBS: todayBS, type: 'DAILY' })
    .populate({
      path: 'entries.studentId',
      populate: { path: 'parentId', populate: { path: 'userId' } }
    });

  let sentCount = 0;
  for (const record of attendanceRecords) {
    const absents = record.entries.filter((e: any) => e.status === 'ABSENT');
    for (const entry of absents) {
      const student: any = entry.studentId;
      if (student && student.parentId && student.parentId.userId) {
        const parentUser = student.parentId.userId;
        const email = parentUser.email;
        
        const text = `Dear Parent, ${student.firstName} is marked ABSENT today (${todayBS}).`;
        await sendMockEmail(email, 'Absence Alert', text, `<p>${text}</p>`);
        
        const notification = await AppNotification.create({
          schoolId,
          recipientUserId: parentUser._id,
          title: 'Absence Alert',
          message: text,
          type: 'ATTENDANCE_ABSENT'
        });
        
        emitToUser(parentUser._id, 'new_notification', notification);
        sentCount++;
      }
    }
  }

  return successResponse(res, { sentCount }, `Absence reminders sent to ${sentCount} parents.`);
};
