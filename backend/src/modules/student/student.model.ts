import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  schoolId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  admissionNumber: string;
  rollNumber?: number;
  currentClassId: mongoose.Types.ObjectId;
  currentSectionId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  dobBS?: string;
  dobAD?: Date;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string;
  address?: string;
  avatarUrl?: string;
  houseId?: mongoose.Types.ObjectId;
  emergencyContact?: string;
  parentId: mongoose.Types.ObjectId;
  status: 'ENROLLED' | 'TRANSFERRED' | 'GRADUATED' | 'SUSPENDED';
}

const StudentSchema = new Schema<IStudent>({
  schoolId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  admissionNumber: { type: String, required: true },
  rollNumber: { type: Number },
  currentClassId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  currentSectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
  academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dobBS: { type: String },
  dobAD: { type: Date },
  gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'], required: true },
  bloodGroup: { type: String },
  address: { type: String },
  avatarUrl: { type: String },
  houseId: { type: Schema.Types.ObjectId, ref: 'House' },
  emergencyContact: { type: String },
  parentId: { type: Schema.Types.ObjectId, ref: 'Parent', required: true },
  status: { type: String, enum: ['ENROLLED', 'TRANSFERRED', 'GRADUATED', 'SUSPENDED'], default: 'ENROLLED' }
}, { timestamps: true });

StudentSchema.index({ schoolId: 1, admissionNumber: 1 }, { unique: true });
StudentSchema.index({ schoolId: 1, currentClassId: 1 });
StudentSchema.index({ schoolId: 1, currentSectionId: 1 });
StudentSchema.index({ schoolId: 1, status: 1 });

export const Student = mongoose.model<IStudent>('Student', StudentSchema);
