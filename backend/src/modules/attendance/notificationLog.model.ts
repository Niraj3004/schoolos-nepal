import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationLog extends Document {
  schoolId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  parentPhone: string;
  dateBS: string;
  type: 'ABSENCE_ALERT';
  status: 'PENDING' | 'SENT' | 'FAILED';
  payload: any;
}

const NotificationLogSchema = new Schema<INotificationLog>({
  schoolId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  parentPhone: { type: String, required: true },
  dateBS: { type: String, required: true },
  type: { type: String, enum: ['ABSENCE_ALERT'], required: true },
  status: { type: String, enum: ['PENDING', 'SENT', 'FAILED'], default: 'PENDING' },
  payload: { type: Schema.Types.Mixed }
}, { timestamps: true });

NotificationLogSchema.index({ schoolId: 1, status: 1 });

export const NotificationLog = mongoose.model<INotificationLog>('NotificationLog', NotificationLogSchema);
