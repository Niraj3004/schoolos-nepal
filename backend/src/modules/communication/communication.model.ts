import mongoose, { Schema, Document } from 'mongoose';

// --- Notice Schema ---
export interface INotice extends Document {
  schoolId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  title: string;
  content: string; // Sanitized HTML
  attachmentUrl?: string;
  targetAudience: ('ALL' | 'TEACHERS' | 'STUDENTS' | 'PARENTS' | 'GRADE_SPECIFIC')[];
  targetClassIds: mongoose.Types.ObjectId[];
  postedBy: mongoose.Types.ObjectId;
  isUrgent: boolean;
  expiresAtBS?: string;
  createdAt: Date;
}
const NoticeSchema = new Schema<INotice>({
  schoolId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  attachmentUrl: { type: String },
  targetAudience: [{ type: String, enum: ['ALL', 'TEACHERS', 'STUDENTS', 'PARENTS', 'GRADE_SPECIFIC'] }],
  targetClassIds: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
  postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isUrgent: { type: Boolean, default: false },
  expiresAtBS: { type: String }
}, { timestamps: true });
export const Notice = mongoose.model<INotice>('Notice', NoticeSchema);


// --- Calendar Event Schema ---
export interface ICalendarEvent extends Document {
  schoolId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  eventType: 'HOLIDAY' | 'EXAM' | 'EVENT' | 'MEETING' | 'SPORTS';
  startDateBS: string;
  endDateBS: string;
  startDateAD: Date;
  endDateAD: Date;
  isHoliday: boolean;
}
const CalendarEventSchema = new Schema<ICalendarEvent>({
  schoolId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  title: { type: String, required: true },
  description: { type: String },
  eventType: { type: String, enum: ['HOLIDAY', 'EXAM', 'EVENT', 'MEETING', 'SPORTS'], required: true },
  startDateBS: { type: String, required: true },
  endDateBS: { type: String, required: true },
  startDateAD: { type: Date, required: true },
  endDateAD: { type: Date, required: true },
  isHoliday: { type: Boolean, default: false }
}, { timestamps: true });
// Index for fast month querying based on BS prefix (e.g. "2083-05")
CalendarEventSchema.index({ schoolId: 1, startDateBS: 1 });
export const CalendarEvent = mongoose.model<ICalendarEvent>('CalendarEvent', CalendarEventSchema);


// --- App Notification Schema ---
export interface IAppNotification extends Document {
  schoolId: mongoose.Types.ObjectId;
  recipientUserId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'ATTENDANCE_ABSENT' | 'FEE_DUE' | 'HOMEWORK_NEW' | 'NOTICE' | 'EXAM_RESULT';
  isRead: boolean;
  createdAt: Date;
}
const AppNotificationSchema = new Schema<IAppNotification>({
  schoolId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  recipientUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['ATTENDANCE_ABSENT', 'FEE_DUE', 'HOMEWORK_NEW', 'NOTICE', 'EXAM_RESULT'], required: true },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });
AppNotificationSchema.index({ recipientUserId: 1, isRead: 1 });
export const AppNotification = mongoose.model<IAppNotification>('AppNotification', AppNotificationSchema);
