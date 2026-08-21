import mongoose, { Schema, Document } from 'mongoose';

export interface IExamSchedule extends Document {
  schoolId: mongoose.Types.ObjectId;
  examId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  examDateBS: string;
  startTime: string;
  endTime: string;
  fullMarks: number;
  passMarks: number;
}

const ExamScheduleSchema = new Schema<IExamSchedule>({
  schoolId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  examDateBS: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  fullMarks: { type: Number, required: true },
  passMarks: { type: Number, required: true }
}, { timestamps: true });

ExamScheduleSchema.index({ schoolId: 1, examId: 1, classId: 1, subjectId: 1 }, { unique: true });

export const ExamSchedule = mongoose.model<IExamSchedule>('ExamSchedule', ExamScheduleSchema);
