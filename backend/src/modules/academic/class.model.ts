import mongoose, { Schema, Document } from 'mongoose';

export interface IClass extends Document {
  schoolId: mongoose.Types.ObjectId;
  name: string;
  numericValue: number;
  order: number;
}

const ClassSchema = new Schema<IClass>({
  schoolId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  name: { type: String, required: true },
  numericValue: { type: Number, required: true },
  order: { type: Number, required: true }
}, { timestamps: true });

ClassSchema.index({ schoolId: 1, name: 1 }, { unique: true });

export const Class = mongoose.model<IClass>('Class', ClassSchema);
