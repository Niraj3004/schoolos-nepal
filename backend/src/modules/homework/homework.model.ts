import mongoose, { Schema, Document } from 'mongoose';

export interface IHomework extends Document {
  schoolId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  sectionId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  attachmentUrls: string[];
  assignedDateBS: string;
  dueDateBS: string;
  dueDateAD: Date;
}

const HomeworkSchema = new Schema<IHomework>({
  schoolId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  attachmentUrls: [{ type: String }],
  assignedDateBS: { type: String, required: true },
  dueDateBS: { type: String, required: true },
  dueDateAD: { type: Date, required: true }
}, { timestamps: true });

HomeworkSchema.index({ schoolId: 1, classId: 1, sectionId: 1 });

export const Homework = mongoose.model<IHomework>('Homework', HomeworkSchema);
