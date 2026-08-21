import mongoose, { Schema, Document } from 'mongoose';

// --- Fee Head ---
export interface IFeeHead extends Document {
  schoolId: mongoose.Types.ObjectId;
  name: string;
  type: 'MONTHLY' | 'ONE_TIME' | 'TERM_WISE';
}
const FeeHeadSchema = new Schema<IFeeHead>({
  schoolId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['MONTHLY', 'ONE_TIME', 'TERM_WISE'], required: true }
}, { timestamps: true });
export const FeeHead = mongoose.model<IFeeHead>('FeeHead', FeeHeadSchema);

// --- Fee Structure ---
export interface IFeeStructure extends Document {
  schoolId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  items: { feeHeadId: mongoose.Types.ObjectId; amount: number }[];
  totalAmount: number;
}
const FeeStructureSchema = new Schema<IFeeStructure>({
  schoolId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  items: [{
    feeHeadId: { type: Schema.Types.ObjectId, ref: 'FeeHead', required: true },
    amount: { type: Number, required: true, min: 0 }
  }],
  totalAmount: { type: Number, required: true, min: 0 }
}, { timestamps: true });
FeeStructureSchema.index({ schoolId: 1, academicYearId: 1, classId: 1 }, { unique: true });
export const FeeStructure = mongoose.model<IFeeStructure>('FeeStructure', FeeStructureSchema);

// --- Student Invoice ---
export interface IStudentInvoice extends Document {
  schoolId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  invoiceNumber: string;
  monthBS: string;
  dueDateBS: string;
  items: { headName: string; amount: number }[];
  subTotal: number;
  discountAmount: number;
  fineAmount: number;
  totalPayable: number;
  paidAmount: number;
  status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'PENDING_VERIFICATION';
}
const StudentInvoiceSchema = new Schema<IStudentInvoice>({
  schoolId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  invoiceNumber: { type: String, required: true },
  monthBS: { type: String, required: true },
  dueDateBS: { type: String, required: true },
  items: [{
    headName: { type: String, required: true },
    amount: { type: Number, required: true }
  }],
  subTotal: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  fineAmount: { type: Number, default: 0 },
  totalPayable: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['UNPAID', 'PARTIALLY_PAID', 'PAID', 'PENDING_VERIFICATION'], default: 'UNPAID' }
}, { timestamps: true });
StudentInvoiceSchema.index({ schoolId: 1, invoiceNumber: 1 }, { unique: true });
export const StudentInvoice = mongoose.model<IStudentInvoice>('StudentInvoice', StudentInvoiceSchema);

// --- Fee Payment Slip ---
export interface IFeePaymentSlip extends Document {
  schoolId: mongoose.Types.ObjectId;
  invoiceId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  uploadedByParentId: mongoose.Types.ObjectId;
  amountPaid: number;
  bankName?: string;
  transactionReference?: string;
  receiptImageUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
}
const FeePaymentSlipSchema = new Schema<IFeePaymentSlip>({
  schoolId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  invoiceId: { type: Schema.Types.ObjectId, ref: 'StudentInvoice', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  uploadedByParentId: { type: Schema.Types.ObjectId, ref: 'Parent', required: true },
  amountPaid: { type: Number, required: true, min: 1 },
  bankName: { type: String },
  transactionReference: { type: String },
  receiptImageUrl: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  rejectionReason: { type: String },
  verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date }
}, { timestamps: true });
export const FeePaymentSlip = mongoose.model<IFeePaymentSlip>('FeePaymentSlip', FeePaymentSlipSchema);

// --- Invoice Counter (Atomic generation) ---
export interface IInvoiceCounter extends Document {
  schoolId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  sequenceValue: number;
}
const InvoiceCounterSchema = new Schema<IInvoiceCounter>({
  schoolId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  sequenceValue: { type: Number, default: 0 }
});
InvoiceCounterSchema.index({ schoolId: 1, academicYearId: 1 }, { unique: true });
export const InvoiceCounter = mongoose.model<IInvoiceCounter>('InvoiceCounter', InvoiceCounterSchema);
