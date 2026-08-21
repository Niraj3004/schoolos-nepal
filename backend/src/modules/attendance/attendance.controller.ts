import { Request, Response } from 'express';
import { AttendanceRecord } from './attendance.model';
import { NotificationLog } from './notificationLog.model';
import { Section } from '../academic/section.model';
import { SubjectAllocation } from '../academic/subjectAllocation.model';
import { Student } from '../student/student.model';
import { Parent } from '../student/parent.model';
import { successResponse, errorResponse } from '../../utils/response';

export const submitAttendance = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const userId = req.user?.userId;
  const role = req.user?.role;
  const payload = req.body;

  // 1. RBAC Guard: Verify Teacher Assignment if not ADMIN
  if (role !== 'ADMIN') {
    if (payload.type === 'DAILY') {
      const section = await Section.findOne({ _id: payload.sectionId, schoolId });
      if (!section || section.classTeacherId?.toString() !== userId) {
        return errorResponse(res, 'FORBIDDEN', 'You are not the assigned Class Teacher for this section', null, 403);
      }
    } else if (payload.type === 'SUBJECT_WISE') {
      if (!payload.subjectId) return errorResponse(res, 'BAD_REQUEST', 'subjectId is required for SUBJECT_WISE attendance', null, 400);
      const allocation = await SubjectAllocation.findOne({ 
        schoolId, sectionId: payload.sectionId, subjectId: payload.subjectId 
      });
      if (!allocation || allocation.teacherId.toString() !== userId) {
        return errorResponse(res, 'FORBIDDEN', 'You are not allocated to teach this subject in this section', null, 403);
      }
    }
  }

  // 2. Upsert Logic (Overwrite cleanly if exists)
  const matchCriteria = {
    schoolId,
    classId: payload.classId,
    sectionId: payload.sectionId,
    dateBS: payload.dateBS,
    type: payload.type,
    subjectId: payload.subjectId || null
  };

  const record = await AttendanceRecord.findOneAndUpdate(
    matchCriteria,
    {
      ...payload,
      schoolId,
      takenBy: userId,
      subjectId: payload.subjectId || null
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // 3. Notification Dispatcher Hook
  const absentEntries = payload.entries.filter((e: any) => e.status === 'ABSENT');
  
  if (absentEntries.length > 0) {
    const studentIds = absentEntries.map((e: any) => e.studentId);
    // Fetch students to resolve parent relationships
    const students = await Student.find({ _id: { $in: studentIds }, schoolId }).populate('parentId');

    const notificationLogs = students.map((student: any) => {
      const parent = student.parentId;
      return {
        schoolId,
        studentId: student._id,
        parentPhone: parent.primaryPhone,
        dateBS: payload.dateBS,
        type: 'ABSENCE_ALERT',
        status: 'PENDING',
        payload: {
          studentName: `${student.firstName} ${student.lastName}`,
          date: payload.dateBS,
          type: payload.type
        }
      };
    });

    if (notificationLogs.length > 0) {
      await NotificationLog.insertMany(notificationLogs);
    }
  }

  return successResponse(res, record, 'Attendance submitted successfully');
};

export const getClassAttendance = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const { classId, sectionId, dateBS, type, subjectId } = req.query;

  const query: any = { schoolId, classId, sectionId, dateBS };
  if (type) query.type = type;
  if (subjectId) query.subjectId = subjectId;

  const record = await AttendanceRecord.findOne(query).populate('takenBy', 'name email');
  return successResponse(res, record, 'Attendance record retrieved');
};

export const getStudentSummary = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const { studentId } = req.params;

  // Aggregate student attendance across records
  const records = await AttendanceRecord.find({ 
    schoolId, 
    'entries.studentId': studentId 
  });

  let totalDays = 0;
  let presentDays = 0;
  let absentDays = 0;

  records.forEach(record => {
    const entry = record.entries.find(e => e.studentId.toString() === studentId);
    if (entry) {
      totalDays++;
      if (entry.status === 'PRESENT' || entry.status === 'LATE') presentDays++;
      else if (entry.status === 'ABSENT' || entry.status === 'EXCUSED') absentDays++;
    }
  });

  const percentage = totalDays === 0 ? 0 : (presentDays / totalDays) * 100;

  return successResponse(res, { totalDays, presentDays, absentDays, percentage: percentage.toFixed(2) }, 'Student attendance summary retrieved');
};

export const getMyChildAttendance = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const userId = req.user?.userId;
  const { studentId } = req.params;

  // Verify the parent actually owns this child
  const parent = await Parent.findOne({ schoolId, userId, children: studentId as any });
  if (!parent) return errorResponse(res, 'FORBIDDEN', 'Access denied to this student profile', null, 403);

  // Return exactly the same summary logic
  return getStudentSummary(req, res);
};
