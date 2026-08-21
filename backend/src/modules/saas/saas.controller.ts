import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { PlatformPlan, PlatformSetting, TenantSubscription } from './saas.model';
import { Tenant } from '../tenant/tenant.model';
import { User } from '../auth/user.model';
import { uploadToCloudinary } from '../../utils/cloudinaryStream';
import { successResponse, errorResponse } from '../../utils/response';

export const getPlans = async (req: Request, res: Response) => {
  const plans = await PlatformPlan.find({ isActive: true });
  return successResponse(res, plans, 'Plans retrieved');
};

export const getPlatformQr = async (req: Request, res: Response) => {
  const setting = await PlatformSetting.findOne();
  if (!setting) return errorResponse(res, 'NOT_FOUND', 'Platform settings not configured', null, 404);
  return successResponse(res, setting, 'Platform payment details retrieved');
};

export const registerSchool = async (req: Request, res: Response) => {
  const {
    schoolName, schoolCode, schoolAddress, schoolPhone,
    adminEmail, adminPassword, adminName,
    planId, billingCycle, transactionReference
  } = req.body;

  if (!req.file) return errorResponse(res, 'BAD_REQUEST', 'Payment slip receipt image is required', null, 400);

  // 1. Verify Plan
  const plan = await PlatformPlan.findById(planId);
  if (!plan) return errorResponse(res, 'NOT_FOUND', 'Selected platform plan not found', null, 404);

  // 2. Check if slug exists
  const existingTenant = await Tenant.findOne({ code: schoolCode });
  if (existingTenant) return errorResponse(res, 'CONFLICT', 'School slug is already taken', null, 409);

  // 3. Upload Receipt
  const uploadResult = await uploadToCloudinary(req.file.buffer, 'schoolos/saas-receipts');

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // A. Create Tenant
    const tenant = await Tenant.create([{
      name: schoolName,
      code: schoolCode,
      address: schoolAddress,
      phone: schoolPhone,
      principalName: adminName,
      subscriptionStatus: 'PENDING'
    }], { session }).then(res => res[0]);

    // B. Create School Admin
    await User.create([{
      email: adminEmail.toLowerCase(),
      password: adminPassword,
      role: 'ADMIN',
      schoolId: tenant._id
    }], { session });

    // C. Create Tenant Subscription
    const amountNPR = billingCycle === 'ANNUAL' ? plan.priceNPRPerYear : plan.priceNPRPerYear / 2;

    const subscription = await TenantSubscription.create([{
      schoolId: tenant._id,
      planId: plan._id,
      billingCycle,
      amountNPR,
      slipImageUrl: uploadResult.secure_url,
      transactionReference,
      status: 'PENDING_APPROVAL'
    }], { session }).then(res => res[0]);

    await session.commitTransaction();
    session.endSession();

    return successResponse(res, { tenant, subscription }, 'School registration submitted and pending verification', 201);
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    return errorResponse(res, 'INTERNAL_SERVER_ERROR', error.message, null, 500);
  }
};

export const getAdminRequests = async (req: Request, res: Response) => {
  const requests = await TenantSubscription.find({ status: 'PENDING_APPROVAL' })
    .populate('schoolId')
    .populate('planId');
  return successResponse(res, requests, 'Pending subscription requests retrieved');
};

export const reviewRequest = async (req: Request, res: Response) => {
  const adminId = req.user?.userId;
  const { id } = req.params;
  const { status, rejectionReason } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const subscription = await TenantSubscription.findById(id).session(session);
    if (!subscription) throw new Error('Subscription request not found');
    if (subscription.status !== 'PENDING_APPROVAL') throw new Error('Subscription is not pending approval');

    subscription.status = status;
    subscription.reviewedBy = adminId as any;

    if (status === 'ACTIVE') {
      const now = new Date();
      const end = new Date();
      end.setDate(now.getDate() + (subscription.billingCycle === 'ANNUAL' ? 365 : 180));
      
      subscription.startDate = now;
      subscription.endDate = end;

      await Tenant.findByIdAndUpdate(subscription.schoolId, { subscriptionStatus: 'ACTIVE' }, { session });
    } else if (status === 'REJECTED') {
      subscription.rejectionReason = rejectionReason || 'Payment rejected by SuperAdmin';
      await Tenant.findByIdAndUpdate(subscription.schoolId, { subscriptionStatus: 'SUSPENDED' }, { session });
    }

    await subscription.save({ session });

    await session.commitTransaction();
    session.endSession();

    return successResponse(res, subscription, `Subscription request ${status.toLowerCase()}`);
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    return errorResponse(res, 'BAD_REQUEST', error.message, null, 400);
  }
};
