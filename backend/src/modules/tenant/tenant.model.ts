import mongoose, { Schema, Document } from 'mongoose';

export interface ITenant extends Document {
  name: string;
  subdomain: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
}

const TenantSchema = new Schema<ITenant>({
  name: { type: String, required: true },
  subdomain: { type: String, required: true, unique: true },
  status: { type: String, enum: ['ACTIVE', 'SUSPENDED', 'PENDING'], default: 'PENDING' }
}, { timestamps: true });

export const Tenant = mongoose.model<ITenant>('Tenant', TenantSchema);
