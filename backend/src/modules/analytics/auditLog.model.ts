import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  schoolId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userRole: string;
  action: string;
  ipAddress: string;
  details: any;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  schoolId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userRole: { type: String, required: true },
  action: { type: String, required: true },
  ipAddress: { type: String },
  details: { type: Schema.Types.Mixed }
}, { timestamps: true });

// Index for efficient chronological querying within a tenant
AuditLogSchema.index({ schoolId: 1, createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
