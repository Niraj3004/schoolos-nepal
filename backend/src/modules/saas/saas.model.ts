import mongoose, { Schema, Document } from 'mongoose';

// --- Platform Plan ---
export interface IPlatformPlan extends Document {
  name: 'Starter' | 'Growth' | 'Enterprise';
  maxStudents: number;
  priceNPRPerYear: number;
  features: string[];
  isActive: boolean;
}
const PlatformPlanSchema = new Schema<IPlatformPlan>({
  name: { type: String, enum: ['Starter', 'Growth', 'Enterprise'], required: true },
  maxStudents: { type: Number, required: true },
  priceNPRPerYear: { type: Number, required: true },
  features: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
export const PlatformPlan = mongoose.model<IPlatformPlan>('PlatformPlan', PlatformPlanSchema);

// --- Platform Setting ---
export interface IPlatformSetting extends Document {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  qrCodeImageUrl?: string;
  supportEmail: string;
  supportPhone: string;
}
const PlatformSettingSchema = new Schema<IPlatformSetting>({
  bankName: { type: String, required: true },
  accountName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  branch: { type: String, required: true },
  qrCodeImageUrl: { type: String },
  supportEmail: { type: String, required: true },
  supportPhone: { type: String, required: true }
}, { timestamps: true });
export const PlatformSetting = mongoose.model<IPlatformSetting>('PlatformSetting', PlatformSettingSchema);

// --- Tenant Subscription ---
export interface ITenantSubscription extends Document {
  schoolId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  billingCycle: 'ANNUAL' | 'SEMI_ANNUAL';
  amountNPR: number;
  slipImageUrl: string;
  transactionReference?: string;
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'EXPIRED' | 'REJECTED';
  startDate?: Date;
  endDate?: Date;
  rejectionReason?: string;
  reviewedBy?: mongoose.Types.ObjectId;
}
const TenantSubscriptionSchema = new Schema<ITenantSubscription>({
  schoolId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  planId: { type: Schema.Types.ObjectId, ref: 'PlatformPlan', required: true },
  billingCycle: { type: String, enum: ['ANNUAL', 'SEMI_ANNUAL'], required: true },
  amountNPR: { type: Number, required: true },
  slipImageUrl: { type: String, required: true },
  transactionReference: { type: String },
  status: { type: String, enum: ['PENDING_APPROVAL', 'ACTIVE', 'EXPIRED', 'REJECTED'], default: 'PENDING_APPROVAL' },
  startDate: { type: Date },
  endDate: { type: Date },
  rejectionReason: { type: String },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
export const TenantSubscription = mongoose.model<ITenantSubscription>('TenantSubscription', TenantSubscriptionSchema);
