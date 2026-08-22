import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Student } from './student.model';
import { Parent } from './parent.model';
import { User } from '../auth/user.model';
import { Tenant } from '../tenant/tenant.model';
import { AcademicYear } from '../academic/academicYear.model';
import { uploadToCloudinary } from '../../utils/cloudinaryStream';
import { successResponse, errorResponse } from '../../utils/response';
import { logAudit } from '../../utils/auditLogger';

export const enrollStudent = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const payload = req.body;
  
  const tenant = await Tenant.findById(schoolId);
  if (!tenant) return errorResponse(res, 'NOT_FOUND', 'Tenant not found', null, 404);
  
  const currentYear = await AcademicYear.findOne({ schoolId, isCurrent: true });
  if (!currentYear) return errorResponse(res, 'BAD_REQUEST', 'No active academic year found for enrollment', null, 400);

  const subdomain = tenant.code; // Using unique slug/code

  try {
    // 1. Find or Create Parent User & Parent Record
    let parentUser = await User.findOne({ email: `${payload.primaryPhone}@${subdomain}.schoolos.com` });
    if (!parentUser) {
      parentUser = await User.create({
        email: `${payload.primaryPhone}@${subdomain}.schoolos.com`,
        password: 'Password123!', // Temporary password
        role: 'PARENT',
        schoolId
      });
    }

    let parentRecord = await Parent.findOne({ schoolId, primaryPhone: payload.primaryPhone });
    if (!parentRecord) {
      parentRecord = await Parent.create({
        schoolId,
        userId: parentUser!._id,
        fatherName: payload.fatherName,
        motherName: payload.motherName,
        primaryPhone: payload.primaryPhone,
        secondaryPhone: payload.secondaryPhone,
        occupation: payload.parentOccupation,
        address: payload.parentAddress,
        children: []
      });
    }
    if (!parentRecord) throw new Error('Failed to create parent record');

    // 2. Check duplicate admission number
    const existingStudent = await Student.findOne({ schoolId, admissionNumber: payload.admissionNumber });
    if (existingStudent) throw new Error(`Admission number ${payload.admissionNumber} already exists`);

    // 3. Create Student User
    const studentEmail = `${payload.admissionNumber}@${subdomain}.schoolos.com`.toLowerCase();
    const studentUser = await User.create({
      email: studentEmail,
      password: payload.dobBS || 'Password123!',
      role: 'STUDENT',
      schoolId
    });

    // 4. Handle Avatar Upload
    let avatarUrl;
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, `schoolos/${subdomain}/students/`);
      avatarUrl = uploadResult.secure_url;
    }

    // 5. Create Student Record
    const studentRecord = await Student.create({
      schoolId,
      userId: studentUser._id,
      admissionNumber: payload.admissionNumber,
      rollNumber: payload.rollNumber,
      currentClassId: payload.currentClassId,
      currentSectionId: payload.currentSectionId,
      academicYearId: currentYear._id,
      firstName: payload.firstName,
      lastName: payload.lastName,
      dobBS: payload.dobBS,
      dobAD: payload.dobAD,
      gender: payload.gender,
      bloodGroup: payload.bloodGroup,
      address: payload.address,
      avatarUrl,
      houseId: payload.houseId,
      emergencyContact: payload.emergencyContact,
      parentId: parentRecord._id,
      status: 'ENROLLED'
    });

    // 6. Link Bi-directionally
    parentRecord!.children.push(studentRecord._id as any);
    await parentRecord!.save();

    logAudit(req, 'STUDENT_ENROLLED', { 
      studentId: studentRecord._id, 
      admissionNumber: studentRecord.admissionNumber 
    });

    return successResponse(res, studentRecord, 'Student enrolled successfully', 201);
  } catch (error: any) {
    return errorResponse(res, 'ENROLLMENT_FAILED', error.message, null, 400);
  }
};

export const bulkEnroll = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const { students } = req.body; // Array of student payloads
  
  if (!Array.isArray(students) || students.length === 0) {
    return errorResponse(res, 'BAD_REQUEST', 'Students array is required', null, 400);
  }

  const tenant = await Tenant.findById(schoolId);
  if (!tenant) return errorResponse(res, 'NOT_FOUND', 'Tenant not found', null, 404);
  
  const currentYear = await AcademicYear.findOne({ schoolId, isCurrent: true });
  if (!currentYear) return errorResponse(res, 'BAD_REQUEST', 'No active academic year found for enrollment', null, 400);

  const subdomain = tenant.code;

  try {
    const enrolledStudents = [];

    for (const payload of students) {
      // 1. Find or Create Parent User & Parent Record
      let parentUser = await User.findOne({ email: `${payload.primaryPhone}@${subdomain}.schoolos.com` });
      if (!parentUser) {
        parentUser = await User.create({
          email: `${payload.primaryPhone}@${subdomain}.schoolos.com`,
          password: 'Password123!',
          role: 'PARENT',
          schoolId
        });
      }

      let parentRecord = await Parent.findOne({ schoolId, primaryPhone: payload.primaryPhone });
      if (!parentRecord) {
        parentRecord = await Parent.create({
          schoolId,
          userId: parentUser!._id,
          fatherName: payload.fatherName,
          motherName: payload.motherName,
          primaryPhone: payload.primaryPhone,
          secondaryPhone: payload.secondaryPhone,
          occupation: payload.parentOccupation,
          address: payload.parentAddress,
          children: []
        });
      }

      // 2. Check duplicate admission number
      const existingStudent = await Student.findOne({ schoolId, admissionNumber: payload.admissionNumber });
      if (existingStudent) throw new Error(`Admission number ${payload.admissionNumber} already exists`);

      // 3. Create Student User
      const studentEmail = `${payload.admissionNumber}@${subdomain}.schoolos.com`.toLowerCase();
      const studentUser = await User.create({
        email: studentEmail,
        password: payload.dobBS || 'Password123!',
        role: 'STUDENT',
        schoolId
      });

      // 4. Create Student Record
      const studentRecord = await Student.create({
        schoolId,
        userId: studentUser._id,
        admissionNumber: payload.admissionNumber,
        rollNumber: payload.rollNumber,
        currentClassId: payload.currentClassId,
        currentSectionId: payload.currentSectionId,
        academicYearId: currentYear._id,
        firstName: payload.firstName,
        lastName: payload.lastName,
        dobBS: payload.dobBS,
        dobAD: payload.dobAD,
        gender: payload.gender,
        bloodGroup: payload.bloodGroup,
        address: payload.address,
        houseId: payload.houseId,
        emergencyContact: payload.emergencyContact,
        parentId: parentRecord!._id,
        status: 'ENROLLED'
      });

      // 5. Link Bi-directionally
      if (parentRecord) {
        parentRecord.children.push(studentRecord._id as any);
        await parentRecord.save();
      }
      
      enrolledStudents.push(studentRecord);
    }

    logAudit(req, 'STUDENT_BULK_ENROLLED', { 
      count: enrolledStudents.length 
    });

    return successResponse(res, { count: enrolledStudents.length, enrolledStudents }, 'Bulk enrollment successful', 201);
  } catch (error: any) {
    return errorResponse(res, 'BULK_ENROLLMENT_FAILED', error.message, null, 400);
  }
};

export const getStudents = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const { classId, sectionId, status, search, page = 1, limit = 10 } = req.query;

  const query: any = { schoolId };
  if (classId) query.currentClassId = classId;
  if (sectionId) query.currentSectionId = sectionId;
  if (status) query.status = status;
  
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { admissionNumber: { $regex: search, $options: 'i' } }
    ];
  }

  const students = await Student.find(query)
    .populate('currentClassId', 'name')
    .populate('currentSectionId', 'name')
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));
    
  const total = await Student.countDocuments(query);

  return successResponse(res, { students, total, page: Number(page) }, 'Students retrieved');
};

export const getStudentById = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const { id } = req.params;

  const student = await Student.findOne({ _id: id, schoolId })
    .populate('currentClassId', 'name')
    .populate('currentSectionId', 'name')
    .populate('academicYearId', 'name')
    .populate('houseId', 'name')
    .populate('parentId');

  if (!student) return errorResponse(res, 'NOT_FOUND', 'Student not found', null, 404);

  return successResponse(res, student, 'Student profile retrieved');
};

export const getStudentMe = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const userId = req.user?.userId;

  const student = await Student.findOne({ schoolId, userId })
    .populate('currentClassId', 'name')
    .populate('currentSectionId', 'name');

  if (!student) return errorResponse(res, 'NOT_FOUND', 'Student profile not found for this user', null, 404);

  return successResponse(res, student, 'Student profile retrieved');
};

export const updateStudent = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const { id } = req.params;
  const payload = req.body;

  const student = await Student.findOne({ _id: id, schoolId });
  if (!student) return errorResponse(res, 'NOT_FOUND', 'Student not found', null, 404);

  // Handle avatar upload if present
  if (req.file) {
    const tenant = await Tenant.findById(schoolId);
    const subdomain = tenant?.code || 'default';
    const uploadResult = await uploadToCloudinary(req.file.buffer, `schoolos/${subdomain}/students/`);
    payload.avatarUrl = uploadResult.secure_url;
  }

  const allowedFields = [
    'firstName', 'lastName', 'rollNumber', 'currentClassId', 'currentSectionId',
    'dobBS', 'dobAD', 'gender', 'bloodGroup', 'address', 'avatarUrl',
    'houseId', 'emergencyContact'
  ];

  const updateData: any = {};
  for (const field of allowedFields) {
    if (payload[field] !== undefined) {
      updateData[field] = payload[field];
    }
  }

  const updated = await Student.findOneAndUpdate(
    { _id: id, schoolId },
    { $set: updateData },
    { new: true }
  )
    .populate('currentClassId', 'name')
    .populate('currentSectionId', 'name');

  logAudit(req, 'STUDENT_UPDATED', { studentId: id, fields: Object.keys(updateData) });

  return successResponse(res, updated, 'Student updated successfully');
};

export const updateStudentStatus = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const { id } = req.params;
  const { status } = req.body;

  const student = await Student.findOne({ _id: id, schoolId });
  if (!student) return errorResponse(res, 'NOT_FOUND', 'Student not found', null, 404);

  student.status = status;
  await student.save();

  logAudit(req, 'STUDENT_STATUS_CHANGED', { studentId: id, newStatus: status });

  return successResponse(res, student, `Student status changed to ${status}`);
};
