import { Request, Response } from 'express';
import { Class } from './class.model';
import { Section } from './section.model';
import { Subject } from './subject.model';
import { SubjectAllocation } from './subjectAllocation.model';
import { successResponse, errorResponse } from '../../utils/response';

export const createClass = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const classObj = await Class.create({ ...req.body, schoolId });
  return successResponse(res, classObj, 'Class created successfully', 201);
};

export const getClasses = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const classes = await Class.find({ schoolId }).sort({ order: 1 });
  
  // Also fetch sections for these classes
  const classesWithSections = await Promise.all(classes.map(async (c) => {
    const sections = await Section.find({ classId: c._id }).populate('classTeacherId', 'name email');
    return { ...c.toObject(), sections };
  }));

  return successResponse(res, classesWithSections, 'Classes retrieved');
};

export const createSection = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const section = await Section.create({ ...req.body, schoolId });
  return successResponse(res, section, 'Section created successfully', 201);
};

export const updateSection = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const { id } = req.params;
  const section = await Section.findOneAndUpdate(
    { _id: id, schoolId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!section) return errorResponse(res, 'NOT_FOUND', 'Section not found', null, 404);
  return successResponse(res, section, 'Section updated');
};

export const createSubject = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const subject = await Subject.create({ ...req.body, schoolId });
  return successResponse(res, subject, 'Subject created successfully', 201);
};

export const getSubjects = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const subjects = await Subject.find({ schoolId });
  return successResponse(res, subjects, 'Subjects retrieved');
};

export const allocateSubject = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const allocation = await SubjectAllocation.create({ ...req.body, schoolId });
  return successResponse(res, allocation, 'Teacher allocated successfully', 201);
};

export const getMyClasses = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const teacherId = req.user?.userId;

  const allocations = await SubjectAllocation.find({ schoolId, teacherId })
    .populate('classId', 'name numericValue')
    .populate('sectionId', 'name')
    .populate('subjectId', 'name code isOptional theoryFullMarks practicalFullMarks')
    .populate('academicYearId', 'name');

  return successResponse(res, allocations, 'Assigned classes retrieved');
};
