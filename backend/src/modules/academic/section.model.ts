import mongoose, { Schema, Document } from 'mongoose';

export interface ISection extends Document {
  schoolId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  name: string;
  capacity: number;
  classTeacherId?: mongoose.Types.ObjectId;
}

const SectionSchema = new Schema<ISection>({
  schoolId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  classTeacherId: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

SectionSchema.index({ schoolId: 1, classId: 1, name: 1 }, { unique: true });

export const Section = mongoose.model<ISection>('Section', SectionSchema);
