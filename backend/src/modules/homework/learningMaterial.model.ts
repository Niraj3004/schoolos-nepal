import mongoose, { Schema, Document } from 'mongoose';

export interface ILearningMaterial extends Document {
  schoolId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: 'PDF' | 'IMAGE' | 'DOC';
  tags: string[];
}

const LearningMaterialSchema = new Schema<ILearningMaterial>({
  schoolId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String, required: true },
  fileType: { type: String, enum: ['PDF', 'IMAGE', 'DOC'], required: true },
  tags: [{ type: String }]
}, { timestamps: true });

LearningMaterialSchema.index({ schoolId: 1, classId: 1, subjectId: 1 });

export const LearningMaterial = mongoose.model<ILearningMaterial>('LearningMaterial', LearningMaterialSchema);
