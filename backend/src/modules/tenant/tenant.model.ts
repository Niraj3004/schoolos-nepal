import mongoose, { Schema, Document } from 'mongoose';

export interface ITenant extends Document {
  name: string;
  code: string;
  address: {
    city?: string;
    district?: string;
    province?: string;
  };
  phone?: string;
  email?: string;
  logoUrl?: string;
  principalName?: string;
  subscriptionStatus: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
  currentAcademicYearId?: mongoose.Types.ObjectId;
}

const TenantSchema = new Schema<ITenant>({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  address: {
    city: { type: String },
    district: { type: String },
    province: { type: String }
  },
  phone: { type: String },
  email: { type: String },
  logoUrl: { type: String },
  principalName: { type: String },
  subscriptionStatus: { type: String, enum: ['PENDING', 'ACTIVE', 'EXPIRED', 'SUSPENDED'], default: 'PENDING' },
  currentAcademicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear' }
}, { timestamps: true });

TenantSchema.index({ code: 1 });

export const Tenant = mongoose.model<ITenant>('Tenant', TenantSchema);
