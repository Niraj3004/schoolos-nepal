import { Request, Response } from 'express';
import { Homework } from './homework.model';
import { HomeworkSubmission } from './homeworkSubmission.model';
import { Student } from '../student/student.model';
import { streamToCloudinary, deleteFromCloudinary } from '../../utils/cloudinaryStream';
import { successResponse, errorResponse } from '../../utils/response';

export const createHomework = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const teacherId = req.user?.userId;

  let attachmentUrls: string[] = [];

  // Handle Multiple Files
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const uploadPromises = req.files.map(file => streamToCloudinary(file.buffer, 'schoolos/homework'));
    const results = await Promise.all(uploadPromises);
    attachmentUrls = results.map(r => r.secure_url);
  }

  const homework = await Homework.create({
    ...req.body,
    schoolId,
    teacherId,
    attachmentUrls
  });

  return successResponse(res, homework, 'Homework assigned successfully', 201);
};

export const getClassHomework = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const role = req.user?.role;
  const userId = req.user?.userId;
  
  let { classId, sectionId } = req.query;

  // RBAC Guard for Students
  if (role === 'STUDENT') {
    const student = await Student.findOne({ schoolId, userId });
    if (!student) return errorResponse(res, 'FORBIDDEN', 'Student profile not found', null, 403);
    
    // Force queries to only show their own class/section
    classId = student.currentClassId as any;
    sectionId = student.currentSectionId as any;
  }

  if (!classId || !sectionId) {
    return errorResponse(res, 'BAD_REQUEST', 'classId and sectionId are required', null, 400);
  }

  const homework = await Homework.find({ schoolId, classId, sectionId })
    .populate('subjectId', 'name code')
    .populate('teacherId', 'name')
    .sort({ dueDateAD: 1 });

  return successResponse(res, homework, 'Homework retrieved');
};

export const deleteHomework = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const { id } = req.params;

  const homework = await Homework.findOne({ _id: id, schoolId });
  if (!homework) return errorResponse(res, 'NOT_FOUND', 'Homework not found', null, 404);

  // Clean up Cloudinary orphans
  if (homework.attachmentUrls && homework.attachmentUrls.length > 0) {
    const deletePromises = homework.attachmentUrls.map(url => deleteFromCloudinary(url));
    await Promise.all(deletePromises);
  }

  await Homework.deleteOne({ _id: id });
  return successResponse(res, null, 'Homework deleted successfully');
};

export const submitHomework = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const userId = req.user?.userId;
  const { id: homeworkId } = req.params;

  const student = await Student.findOne({ schoolId, userId });
  if (!student) return errorResponse(res, 'FORBIDDEN', 'Student profile not found', null, 403);

  let fileUrls: string[] = [];

  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const uploadPromises = req.files.map(file => streamToCloudinary(file.buffer, 'schoolos/submissions'));
    const results = await Promise.all(uploadPromises);
    fileUrls = results.map(r => r.secure_url);
  }

  const submission = await HomeworkSubmission.findOneAndUpdate(
    { schoolId, homeworkId, studentId: student._id },
    {
      schoolId,
      homeworkId,
      studentId: student._id,
      submissionText: req.body.submissionText,
      $push: { fileUrls: { $each: fileUrls } },
      submittedAt: new Date(),
      status: 'SUBMITTED'
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return successResponse(res, submission, 'Homework submitted successfully');
};

export const evaluateSubmission = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const { id } = req.params;

  const submission = await HomeworkSubmission.findOneAndUpdate(
    { _id: id, schoolId },
    { ...req.body },
    { new: true }
  );

  if (!submission) return errorResponse(res, 'NOT_FOUND', 'Submission not found', null, 404);

  return successResponse(res, submission, 'Submission evaluated');
};
