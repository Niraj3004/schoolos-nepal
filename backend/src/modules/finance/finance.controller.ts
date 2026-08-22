import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { FeeHead, FeeStructure, StudentInvoice, FeePaymentSlip, InvoiceCounter } from './finance.model';
import { Student } from '../student/student.model';
import { Parent } from '../student/parent.model';
import { uploadToCloudinary } from '../../utils/cloudinaryStream';
import { successResponse, errorResponse } from '../../utils/response';
import { logAudit } from '../../utils/auditLogger';

export const createFeeHead = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const head = await FeeHead.create({ ...req.body, schoolId });
  return successResponse(res, head, 'Fee Head created', 201);
};

export const createFeeStructure = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  let totalAmount = 0;
  
  for (const item of req.body.items) {
    totalAmount += item.amount;
  }

  const structure = await FeeStructure.create({
    ...req.body,
    schoolId,
    totalAmount
  });

  return successResponse(res, structure, 'Fee Structure defined', 201);
};

export const generateMonthlyInvoices = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const { academicYearId, classId, monthBS, dueDateBS, discounts = {} } = req.body;

  // 1. Get Structure
  const structure = await FeeStructure.findOne({ schoolId, academicYearId, classId }).populate('items.feeHeadId');
  if (!structure) return errorResponse(res, 'NOT_FOUND', 'Fee structure not found for this class', null, 404);

  // 2. Format Items
  const invoiceItems = structure.items.map((item: any) => ({
    headName: item.feeHeadId.name,
    amount: item.amount
  }));

  // 3. Get all active students in class
  const students = await Student.find({ schoolId, currentClassId: classId, status: 'ENROLLED' });
  if (!students.length) return errorResponse(res, 'BAD_REQUEST', 'No enrolled students found in this class', null, 400);

  try {
    const invoicesToInsert = [];

    for (const student of students) {
      // Atomic increment for invoice number
      const counter = await InvoiceCounter.findOneAndUpdate(
        { schoolId, academicYearId },
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true }
      );

      const paddedSeq = counter.sequenceValue.toString().padStart(5, '0');
      // Format: INV-<Year>-<Seq>
      const currentYear = new Date().getFullYear();
      const invoiceNumber = `INV-${currentYear}-${paddedSeq}`; 

      const discount = discounts[student._id.toString()] || 0;
      const subTotal = structure.totalAmount;
      const totalPayable = subTotal - discount;

      invoicesToInsert.push({
        schoolId,
        studentId: student._id,
        academicYearId,
        invoiceNumber,
        monthBS,
        dueDateBS,
        items: invoiceItems,
        subTotal,
        discountAmount: discount,
        totalPayable,
        paidAmount: 0,
        status: totalPayable <= 0 ? 'PAID' : 'UNPAID'
      });
    }

    const invoices = await StudentInvoice.insertMany(invoicesToInsert);
    
    return successResponse(res, { generatedCount: invoices.length }, 'Monthly invoices generated successfully', 201);
  } catch (error: any) {
    return errorResponse(res, 'INTERNAL_SERVER_ERROR', error.message, null, 500);
  }
};

export const uploadSlip = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const userId = req.user?.userId; // PARENT user ID
  const { id: invoiceId } = req.params;
  const { amountPaid, bankName, transactionReference } = req.body;

  if (!req.file) return errorResponse(res, 'BAD_REQUEST', 'Payment slip receipt image is required', null, 400);

  const invoice = await StudentInvoice.findOne({ _id: invoiceId as any, schoolId });
  if (!invoice) return errorResponse(res, 'NOT_FOUND', 'Invoice not found', null, 404);

  // Verify Parent owns this student
  const parent = await Parent.findOne({ schoolId, userId, children: invoice.studentId });
  if (!parent) return errorResponse(res, 'FORBIDDEN', 'Access denied to this student invoice', null, 403);

  // Stream to Cloudinary
  const uploadResult = await uploadToCloudinary(req.file.buffer, 'schoolos/receipts');

  const slip = await FeePaymentSlip.create({
    schoolId,
    invoiceId: invoiceId as any,
    studentId: invoice.studentId,
    uploadedByParentId: parent._id,
    amountPaid: Number(amountPaid),
    bankName,
    transactionReference,
    receiptImageUrl: uploadResult.secure_url,
    status: 'PENDING'
  });

  // Update invoice status
  invoice.status = 'PENDING_VERIFICATION';
  await invoice.save();

  return successResponse(res, slip, 'Payment slip uploaded and pending verification', 201);
};

export const getPendingSlips = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const slips = await FeePaymentSlip.find({ schoolId, status: 'PENDING' })
    .populate('studentId', 'firstName lastName admissionNumber')
    .populate('invoiceId', 'invoiceNumber totalPayable monthBS')
    .populate('uploadedByParentId', 'fatherName primaryPhone');
  
  return successResponse(res, slips, 'Pending slips retrieved');
};

export const verifySlip = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const adminId = req.user?.userId;
  const { id } = req.params;
  const { status, rejectionReason } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const slip = await FeePaymentSlip.findOne({ _id: id as any, schoolId, status: 'PENDING' }).session(session);
    if (!slip) throw new Error('Pending payment slip not found');

    const invoice = await StudentInvoice.findOne({ _id: slip.invoiceId, schoolId }).session(session);
    if (!invoice) throw new Error('Associated invoice not found');

    slip.status = status;
    slip.verifiedBy = adminId as any;
    slip.verifiedAt = new Date();

    if (status === 'APPROVED') {
      invoice.paidAmount += slip.amountPaid;
      if (invoice.paidAmount >= invoice.totalPayable) {
        invoice.status = 'PAID';
      } else {
        invoice.status = 'PARTIALLY_PAID';
      }
    } else if (status === 'REJECTED') {
      slip.rejectionReason = rejectionReason || 'Receipt invalid or amount mismatch';
      // Revert invoice status. If it was partially paid before, it's complex, but assuming UNPAID for simple flow
      invoice.status = invoice.paidAmount > 0 ? 'PARTIALLY_PAID' : 'UNPAID';
    }

    await slip.save({ session });
    await invoice.save({ session });

    await session.commitTransaction();
    session.endSession();

    logAudit(req, 'FEE_SLIP_VERIFIED', { 
      invoiceId: invoice._id, 
      slipId: slip._id, 
      status, 
      amountVerified: slip.amountPaid 
    });

    return successResponse(res, { invoice, slip }, `Payment slip ${status.toLowerCase()} successfully`);
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    return errorResponse(res, 'BAD_REQUEST', error.message, null, 400);
  }
};

export const getInvoices = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const { classId, monthBS, status, page = 1, limit = 20 } = req.query;

  const query: any = { schoolId };
  if (classId) {
    // Need to find students in this class first
    const students = await Student.find({ schoolId, currentClassId: classId as string }, '_id');
    query.studentId = { $in: students.map(s => s._id) };
  }
  if (monthBS) query.monthBS = monthBS as string;
  if (status) query.status = status as string;

  const invoices = await StudentInvoice.find(query)
    .populate('studentId', 'firstName lastName admissionNumber currentClassId currentSectionId')
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  const total = await StudentInvoice.countDocuments(query);

  return successResponse(res, { invoices, total, page: Number(page) }, 'Invoices retrieved');
};

export const getMyInvoices = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const userId = req.user?.userId;

  // Find parent and their children
  const parent = await Parent.findOne({ schoolId, userId });
  if (!parent) return errorResponse(res, 'NOT_FOUND', 'Parent profile not found', null, 404);

  const invoices = await StudentInvoice.find({
    schoolId,
    studentId: { $in: parent.children }
  })
    .populate('studentId', 'firstName lastName admissionNumber')
    .sort({ createdAt: -1 });

  return successResponse(res, invoices, 'Your invoices retrieved');
};

export const getInvoiceById = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const { id } = req.params;

  const invoice = await StudentInvoice.findOne({ _id: id, schoolId })
    .populate('studentId', 'firstName lastName admissionNumber currentClassId currentSectionId');

  if (!invoice) return errorResponse(res, 'NOT_FOUND', 'Invoice not found', null, 404);

  // Also get payment slips for this invoice
  const slips = await FeePaymentSlip.find({ invoiceId: id, schoolId })
    .populate('verifiedBy', 'email')
    .sort({ createdAt: -1 });

  return successResponse(res, { invoice, slips }, 'Invoice details retrieved');
};
