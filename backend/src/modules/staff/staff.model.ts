import mongoose, { Schema, Document } from 'mongoose';

export interface IStaff extends Document {
  schoolId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  employeeId: string;
  firstName: string;
  lastName: string;
  department: string;
  designation: string;
  phone: string;
  address?: string;
  joinDateBS?: string;
  avatarUrl?: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED';
}

const StaffSchema = new Schema<IStaff>({
  schoolId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String },
  joinDateBS: { type: String },
  avatarUrl: { type: String },
  status: { type: String, enum: ['ACTIVE', 'ON_LEAVE', 'TERMINATED'], default: 'ACTIVE' }
}, { timestamps: true });

StaffSchema.index({ schoolId: 1, employeeId: 1 }, { unique: true });

export const Staff = mongoose.model<IStaff>('Staff', StaffSchema);
