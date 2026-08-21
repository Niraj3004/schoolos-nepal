import mongoose, { Schema, Document } from 'mongoose';

export interface IExam extends Document {
  schoolId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  termId: mongoose.Types.ObjectId;
  name: string;
  startDateBS: string;
  endDateBS: string;
  isPublished: boolean;
}

const ExamSchema = new Schema<IExam>({
  schoolId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  termId: { type: Schema.Types.ObjectId, ref: 'Term', required: true },
  name: { type: String, required: true },
  startDateBS: { type: String, required: true },
  endDateBS: { type: String, required: true },
  isPublished: { type: Boolean, default: false }
}, { timestamps: true });

ExamSchema.index({ schoolId: 1, academicYearId: 1, termId: 1, name: 1 }, { unique: true });

export const Exam = mongoose.model<IExam>('Exam', ExamSchema);
