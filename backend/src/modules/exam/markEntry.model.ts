import mongoose, { Schema, Document } from 'mongoose';

export interface IMarkEntry extends Document {
  schoolId: mongoose.Types.ObjectId;
  examId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  sectionId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  theoryMarksObtained: number;
  practicalMarksObtained: number;
  isAbsent: boolean;
  evaluatedBy: mongoose.Types.ObjectId;
}

const MarkEntrySchema = new Schema<IMarkEntry>({
  schoolId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  theoryMarksObtained: { type: Number, default: 0 },
  practicalMarksObtained: { type: Number, default: 0 },
  isAbsent: { type: Boolean, default: false },
  evaluatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

MarkEntrySchema.index({ schoolId: 1, examId: 1, subjectId: 1, studentId: 1 }, { unique: true });
MarkEntrySchema.index({ schoolId: 1, examId: 1, sectionId: 1 });

export const MarkEntry = mongoose.model<IMarkEntry>('MarkEntry', MarkEntrySchema);
