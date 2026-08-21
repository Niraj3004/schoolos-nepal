import { Request, Response } from 'express';
import { Student } from '../student/student.model';
import { User } from '../auth/user.model';
import { Notice } from '../communication/communication.model';
import { successResponse } from '../../utils/response';

export const globalSearch = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const q = req.query.q as string;

  if (!q || q.length < 2) {
    return successResponse(res, { students: [], staff: [], notices: [] }, 'Query too short');
  }

  const regex = new RegExp(q, 'i');

  const [students, staff, notices] = await Promise.all([
    Student.find({
      schoolId,
      $or: [
        { firstName: regex },
        { lastName: regex },
        { admissionNumber: regex }
      ]
    }).limit(10).select('firstName lastName admissionNumber avatarUrl status'),

    User.find({
      schoolId,
      $or: [
        { name: regex },
        { email: regex }
      ]
    }).limit(10).select('name email role avatarUrl'),

    Notice.find({
      schoolId,
      $or: [
        { title: regex },
        { content: regex }
      ]
    }).limit(10).select('title isUrgent createdAt')
  ]);

  return successResponse(res, {
    students,
    staff,
    notices
  }, 'Search results retrieved');
};
