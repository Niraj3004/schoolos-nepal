import mongoose, { Schema, Document } from 'mongoose';

export interface ITerm extends Document {
  schoolId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  name: string;
  termOrder: number;
  startDateBS: string;
  endDateBS: string;
}

const TermSchema = new Schema<ITerm>({
  schoolId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  name: { type: String, required: true },
  termOrder: { type: Number, required: true },
  startDateBS: { type: String, required: true },
  endDateBS: { type: String, required: true }
}, { timestamps: true });

TermSchema.index({ schoolId: 1, academicYearId: 1, termOrder: 1 }, { unique: true });

export const Term = mongoose.model<ITerm>('Term', TermSchema);
