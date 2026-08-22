import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Staff } from './staff.model';
import { User } from '../auth/user.model';
import { Tenant } from '../tenant/tenant.model';
import { successResponse, errorResponse } from '../../utils/response';

export const getTeachers = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const { search, page = 1, limit = 10 } = req.query;

  const query: any = { schoolId, department: 'ACADEMIC' };
  
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } }
    ];
  }

  const teachers = await Staff.find(query)
    .populate('userId', 'email isActive')
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .sort({ createdAt: -1 });
    
  const total = await Staff.countDocuments(query);

  return successResponse(res, { teachers, total, page: Number(page) }, 'Teachers retrieved');
};

export const createTeacher = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const payload = req.body;
  
  const tenant = await Tenant.findById(schoolId);
  if (!tenant) return errorResponse(res, 'NOT_FOUND', 'Tenant not found', null, 404);
  const subdomain = tenant.code;

  try {
    const existingStaff = await Staff.findOne({ schoolId, employeeId: payload.employeeId });
    if (existingStaff) throw new Error(`Employee ID ${payload.employeeId} already exists`);

    const teacherEmail = `${payload.employeeId}@${subdomain}.schoolos.com`.toLowerCase();
    const teacherUser = await User.create({
      email: teacherEmail,
      password: payload.phone || 'Teacher123!',
      role: 'TEACHER',
      schoolId
    });

    const staffRecord = await Staff.create({
      schoolId,
      userId: teacherUser._id,
      employeeId: payload.employeeId,
      firstName: payload.firstName,
      lastName: payload.lastName,
      department: payload.department || 'ACADEMIC',
      designation: payload.designation || 'TEACHER',
      phone: payload.phone,
      address: payload.address,
      joinDateBS: payload.joinDateBS,
      status: 'ACTIVE'
    });

    return successResponse(res, staffRecord, 'Teacher created successfully', 201);
  } catch (error: any) {
    return errorResponse(res, 'TEACHER_CREATION_FAILED', error.message, null, 400);
  }
};

export const getTeacherById = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const { id } = req.params;

  const teacher = await Staff.findOne({ _id: id, schoolId })
    .populate('userId', 'email isActive');

  if (!teacher) return errorResponse(res, 'NOT_FOUND', 'Teacher not found', null, 404);

  return successResponse(res, teacher, 'Teacher retrieved');
};

export const updateTeacher = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const { id } = req.params;
  const payload = req.body;

  const teacher = await Staff.findOne({ _id: id, schoolId });
  if (!teacher) return errorResponse(res, 'NOT_FOUND', 'Teacher not found', null, 404);

  const allowedFields = [
    'firstName', 'lastName', 'phone', 'address', 'department',
    'designation', 'joinDateBS', 'status'
  ];

  const updateData: any = {};
  for (const field of allowedFields) {
    if (payload[field] !== undefined) {
      updateData[field] = payload[field];
    }
  }

  const updated = await Staff.findOneAndUpdate(
    { _id: id, schoolId },
    { $set: updateData },
    { new: true }
  ).populate('userId', 'email isActive');

  return successResponse(res, updated, 'Teacher updated successfully');
};
