import mongoose, { Schema, Document } from 'mongoose';

export interface ISubject extends Document {
  schoolId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  isOptional: boolean;
  creditHours: number;
  theoryFullMarks: number;
  practicalFullMarks: number;
  theoryPassMarks: number;
  practicalPassMarks: number;
}

const SubjectSchema = new Schema<ISubject>({
  schoolId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  isOptional: { type: Boolean, default: false },
  creditHours: { type: Number, required: true },
  theoryFullMarks: { type: Number, required: true },
  practicalFullMarks: { type: Number, required: true },
  theoryPassMarks: { type: Number, required: true },
  practicalPassMarks: { type: Number, required: true }
}, { timestamps: true });

SubjectSchema.index({ schoolId: 1, code: 1 }, { unique: true });

export const Subject = mongoose.model<ISubject>('Subject', SubjectSchema);
