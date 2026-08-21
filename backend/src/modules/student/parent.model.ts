import mongoose, { Schema, Document } from 'mongoose';

export interface IParent extends Document {
  schoolId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  fatherName?: string;
  motherName?: string;
  primaryPhone: string;
  secondaryPhone?: string;
  occupation?: string;
  address?: string;
  children: mongoose.Types.ObjectId[];
}

const ParentSchema = new Schema<IParent>({
  schoolId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fatherName: { type: String },
  motherName: { type: String },
  primaryPhone: { type: String, required: true },
  secondaryPhone: { type: String },
  occupation: { type: String },
  address: { type: String },
  children: [{ type: Schema.Types.ObjectId, ref: 'Student' }]
}, { timestamps: true });

ParentSchema.index({ schoolId: 1, primaryPhone: 1 }, { unique: true });

export const Parent = mongoose.model<IParent>('Parent', ParentSchema);
