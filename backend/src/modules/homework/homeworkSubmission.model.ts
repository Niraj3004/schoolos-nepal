import mongoose, { Schema, Document } from 'mongoose';

export interface IHomeworkSubmission extends Document {
  schoolId: mongoose.Types.ObjectId;
  homeworkId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  submissionText?: string;
  fileUrls: string[];
  submittedAt: Date;
  status: 'SUBMITTED' | 'LATE' | 'EVALUATED' | 'RESUBMIT';
  feedback?: string;
  marksObtained?: number;
}

const HomeworkSubmissionSchema = new Schema<IHomeworkSubmission>({
  schoolId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  homeworkId: { type: Schema.Types.ObjectId, ref: 'Homework', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  submissionText: { type: String },
  fileUrls: [{ type: String }],
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['SUBMITTED', 'LATE', 'EVALUATED', 'RESUBMIT'], default: 'SUBMITTED' },
  feedback: { type: String },
  marksObtained: { type: Number }
}, { timestamps: true });

HomeworkSubmissionSchema.index({ schoolId: 1, homeworkId: 1, studentId: 1 }, { unique: true });

export const HomeworkSubmission = mongoose.model<IHomeworkSubmission>('HomeworkSubmission', HomeworkSubmissionSchema);
