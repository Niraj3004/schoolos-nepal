import { Request, Response } from 'express';
import { LearningMaterial } from './learningMaterial.model';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinaryStream';
import { successResponse, errorResponse } from '../../utils/response';
import { Student } from '../student/student.model';

export const createMaterial = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const userId = req.user?.userId;

  if (!req.file) {
    return errorResponse(res, 'BAD_REQUEST', 'File attachment is required', null, 400);
  }

  const uploadResult = await uploadToCloudinary(req.file.buffer, 'schoolos/materials');

  const material = await LearningMaterial.create({
    ...req.body,
    schoolId,
    uploadedBy: userId,
    fileUrl: uploadResult.secure_url
  });

  return successResponse(res, material, 'Learning material uploaded', 201);
};

export const getMaterials = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const role = req.user?.role;
  const userId = req.user?.userId;
  
  let { classId, subjectId } = req.query;

  // RBAC Guard for Students
  if (role === 'STUDENT') {
    const student = await Student.findOne({ schoolId, userId });
    if (!student) return errorResponse(res, 'FORBIDDEN', 'Student profile not found', null, 403);
    
    // Force queries to only show their own class
    classId = student.currentClassId as any;
  }

  const query: any = { schoolId };
  if (classId) query.classId = classId;
  if (subjectId) query.subjectId = subjectId;

  const materials = await LearningMaterial.find(query).populate('subjectId', 'name code').populate('uploadedBy', 'name');
  
  return successResponse(res, materials, 'Materials retrieved');
};

export const deleteMaterial = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const { id } = req.params;

  const material = await LearningMaterial.findOne({ _id: id, schoolId });
  if (!material) return errorResponse(res, 'NOT_FOUND', 'Material not found', null, 404);

  if (material.fileUrl) {
    await deleteFromCloudinary(material.fileUrl);
  }

  await LearningMaterial.deleteOne({ _id: id });
  return successResponse(res, null, 'Material deleted successfully');
};
