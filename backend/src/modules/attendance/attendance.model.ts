import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendanceEntry {
  studentId: mongoose.Types.ObjectId;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
}

export interface IAttendanceRecord extends Document {
  schoolId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  sectionId: mongoose.Types.ObjectId;
  dateBS: string;
  dateAD: Date;
  type: 'DAILY' | 'SUBJECT_WISE';
  subjectId?: mongoose.Types.ObjectId;
  takenBy: mongoose.Types.ObjectId;
  entries: IAttendanceEntry[];
}

const AttendanceEntrySchema = new Schema<IAttendanceEntry>({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  status: { type: String, enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'], required: true },
  remarks: { type: String }
}, { _id: false });

const AttendanceRecordSchema = new Schema<IAttendanceRecord>({
  schoolId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
  dateBS: { type: String, required: true },
  dateAD: { type: Date, required: true },
  type: { type: String, enum: ['DAILY', 'SUBJECT_WISE'], required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', default: null }, // default null for unique index compat
  takenBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  entries: [AttendanceEntrySchema]
}, { timestamps: true });

AttendanceRecordSchema.index({ schoolId: 1, classId: 1, sectionId: 1, dateBS: 1, type: 1, subjectId: 1 }, { unique: true });
AttendanceRecordSchema.index({ schoolId: 1, dateBS: 1 });

export const AttendanceRecord = mongoose.model<IAttendanceRecord>('AttendanceRecord', AttendanceRecordSchema);
