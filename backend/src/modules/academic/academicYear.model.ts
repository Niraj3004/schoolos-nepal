import mongoose, { Schema, Document } from 'mongoose';

export interface IAcademicYear extends Document {
  schoolId: mongoose.Types.ObjectId;
  name: string; // e.g. "2083/2084"
  startDateBS: string;
  endDateBS: string;
  startDateAD: Date;
  endDateAD: Date;
  isCurrent: boolean;
}

const AcademicYearSchema = new Schema<IAcademicYear>({
  schoolId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  name: { type: String, required: true },
  startDateBS: { type: String, required: true },
  endDateBS: { type: String, required: true },
  startDateAD: { type: Date, required: true },
  endDateAD: { type: Date, required: true },
  isCurrent: { type: Boolean, default: false }
}, { timestamps: true });

AcademicYearSchema.index({ schoolId: 1, isCurrent: 1 });
AcademicYearSchema.index({ schoolId: 1, name: 1 }, { unique: true });

export const AcademicYear = mongoose.model<IAcademicYear>('AcademicYear', AcademicYearSchema);
