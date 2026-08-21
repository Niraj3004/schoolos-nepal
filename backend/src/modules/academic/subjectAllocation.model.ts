import mongoose, { Schema, Document } from 'mongoose';

export interface ISubjectAllocation extends Document {
  schoolId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  sectionId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
}

const SubjectAllocationSchema = new Schema<ISubjectAllocation>({
  schoolId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

SubjectAllocationSchema.index({ schoolId: 1, academicYearId: 1, sectionId: 1, subjectId: 1 }, { unique: true });

export const SubjectAllocation = mongoose.model<ISubjectAllocation>('SubjectAllocation', SubjectAllocationSchema);
