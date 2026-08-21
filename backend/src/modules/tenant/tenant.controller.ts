import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Tenant } from './tenant.model';
import { House } from './house.model';
import { AcademicYear } from '../academic/academicYear.model';
import { Term } from '../academic/term.model';
import { successResponse, errorResponse } from '../../utils/response';
import { uploadToCloudinary } from '../../utils/cloudinaryStream';

export const getSettings = async (req: Request, res: Response) => {
  const schoolId = req.tenant;

  const tenant = await Tenant.findById(schoolId);
  if (!tenant) return errorResponse(res, 'NOT_FOUND', 'Tenant not found', null, 404);

  const currentAcademicYear = await AcademicYear.findOne({ schoolId, isCurrent: true });
  let terms: any[] = [];
  if (currentAcademicYear) {
    terms = await Term.find({ schoolId, academicYearId: currentAcademicYear._id }).sort({ termOrder: 1 });
  }

  const houses = await House.find({ schoolId });

  return successResponse(res, {
    tenant,
    currentAcademicYear,
    terms,
    houses
  }, 'Settings retrieved');
};

export const updateSettings = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const updates = req.body;
  
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, 'schoolos/schools/logos/');
    updates.logoUrl = result.secure_url;
  }

  const tenant = await Tenant.findByIdAndUpdate(schoolId, updates, { new: true, runValidators: true });
  if (!tenant) return errorResponse(res, 'NOT_FOUND', 'Tenant not found', null, 404);

  return successResponse(res, tenant, 'Settings updated');
};

export const createAcademicYear = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const data = { ...req.body, schoolId };

  const academicYear = await AcademicYear.create(data);
  return successResponse(res, academicYear, 'Academic year created', 201);
};

export const setCurrentAcademicYear = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const { id } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const targetYear = await AcademicYear.findOne({ _id: id, schoolId }).session(session);
    if (!targetYear) {
      throw new Error('Academic year not found or does not belong to your school');
    }

    await AcademicYear.updateMany(
      { schoolId, _id: { $ne: id } },
      { $set: { isCurrent: false } }
    ).session(session);

    targetYear.isCurrent = true;
    await targetYear.save({ session });
    
    await Tenant.findByIdAndUpdate(schoolId, { currentAcademicYearId: id }, { session });

    await session.commitTransaction();
    session.endSession();

    return successResponse(res, targetYear, 'Current academic year updated');
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    return errorResponse(res, 'TRANSACTION_FAILED', error.message, null, 400);
  }
};

export const createTerm = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const data = { ...req.body, schoolId };
  
  const term = await Term.create(data);
  return successResponse(res, term, 'Term created', 201);
};

export const createHouse = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const data = { ...req.body, schoolId };

  const house = await House.create(data);
  return successResponse(res, house, 'House created', 201);
};

export const getHouses = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const houses = await House.find({ schoolId });
  return successResponse(res, houses, 'Houses retrieved');
};
