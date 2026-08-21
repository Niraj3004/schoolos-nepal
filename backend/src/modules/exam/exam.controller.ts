import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Exam } from './exam.model';
import { MarkEntry } from './markEntry.model';
import { Subject } from '../academic/subject.model';
import { AttendanceRecord } from '../attendance/attendance.model';
import { calculateSubjectGrade, calculateAggregateGPA } from '../../utils/gpaCalculator';
import { successResponse, errorResponse } from '../../utils/response';

export const createExam = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const exam = await Exam.create({ ...req.body, schoolId });
  return successResponse(res, exam, 'Exam created successfully', 201);
};

export const getExams = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const exams = await Exam.find({ schoolId }).populate('academicYearId', 'name').populate('termId', 'name');
  return successResponse(res, exams, 'Exams retrieved');
};

export const submitBulkMarks = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const userId = req.user?.userId;
  const { examId, classId, sectionId, subjectId, marks } = req.body;

  // Verify Subject limits
  const subject = await Subject.findOne({ _id: subjectId, schoolId });
  if (!subject) return errorResponse(res, 'NOT_FOUND', 'Subject not found', null, 404);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const entry of marks) {
      if (entry.theoryMarksObtained > subject.theoryFullMarks) {
        throw new Error(`Theory marks (${entry.theoryMarksObtained}) exceed full marks (${subject.theoryFullMarks}) for student ${entry.studentId}`);
      }
      if (entry.practicalMarksObtained > subject.practicalFullMarks) {
        throw new Error(`Practical marks (${entry.practicalMarksObtained}) exceed full marks (${subject.practicalFullMarks}) for student ${entry.studentId}`);
      }

      await MarkEntry.findOneAndUpdate(
        { schoolId, examId, subjectId, studentId: entry.studentId },
        {
          schoolId,
          examId,
          classId,
          sectionId,
          subjectId,
          studentId: entry.studentId,
          theoryMarksObtained: entry.theoryMarksObtained || 0,
          practicalMarksObtained: entry.practicalMarksObtained || 0,
          isAbsent: entry.isAbsent || false,
          evaluatedBy: userId
        },
        { upsert: true, new: true, session }
      );
    }
    
    await session.commitTransaction();
    session.endSession();
    return successResponse(res, null, 'Bulk marks submitted successfully');
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    return errorResponse(res, 'BAD_REQUEST', error.message, null, 400);
  }
};

export const getReportCard = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const { examId, studentId } = req.params;
  const role = req.user?.role;

  const exam = await Exam.findOne({ _id: examId, schoolId });
  if (!exam) return errorResponse(res, 'NOT_FOUND', 'Exam not found', null, 404);

  // RBAC Guard: Protect unpublished exams from students and parents
  if (!exam.isPublished && (role === 'STUDENT' || role === 'PARENT')) {
    return errorResponse(res, 'FORBIDDEN', 'Exam results are not published yet', null, 403);
  }

  // Fetch all marks for this student
  const studentMarks = await MarkEntry.find({ schoolId, examId, studentId }).populate('subjectId');
  if (!studentMarks.length) return errorResponse(res, 'NOT_FOUND', 'No marks found for this student', null, 404);

  const sectionId = studentMarks[0].sectionId; // Assuming all marks are in the same section for the exam

  // Calculate Breakdown
  const subjectResults = [];
  const gpaInputs = [];
  
  for (const mark of studentMarks) {
    const subject = mark.subjectId as any;
    let result = { grade: 'NG', gpa: 0.0 };
    
    if (!mark.isAbsent) {
      result = calculateSubjectGrade(
        mark.theoryMarksObtained,
        mark.practicalMarksObtained,
        subject.theoryFullMarks,
        subject.practicalFullMarks
      );
    } else {
      result = { grade: 'ABS', gpa: 0.0 }; // Absent
    }

    gpaInputs.push({ gpa: result.gpa, creditHours: subject.creditHours });

    subjectResults.push({
      subject: subject.name,
      code: subject.code,
      creditHours: subject.creditHours,
      theoryFull: subject.theoryFullMarks,
      theoryObtained: mark.theoryMarksObtained,
      practicalFull: subject.practicalFullMarks,
      practicalObtained: mark.practicalMarksObtained,
      totalObtained: mark.theoryMarksObtained + mark.practicalMarksObtained,
      grade: result.grade,
      gradePoint: result.gpa,
      isAbsent: mark.isAbsent
    });
  }

  const aggregateGPA = calculateAggregateGPA(gpaInputs);

  // Calculate Rank dynamically
  const allSectionMarks = await MarkEntry.find({ schoolId, examId, sectionId }).populate('subjectId');
  const studentGPAMap = new Map<string, { gpaInputs: { gpa: number; creditHours: number }[] }>();

  for (const mark of allSectionMarks) {
    const sId = mark.studentId.toString();
    if (!studentGPAMap.has(sId)) studentGPAMap.set(sId, { gpaInputs: [] });

    const subject = mark.subjectId as any;
    let resGPA = 0;
    if (!mark.isAbsent) {
      resGPA = calculateSubjectGrade(
        mark.theoryMarksObtained, mark.practicalMarksObtained,
        subject.theoryFullMarks, subject.practicalFullMarks
      ).gpa;
    }
    studentGPAMap.get(sId)!.gpaInputs.push({ gpa: resGPA, creditHours: subject.creditHours });
  }

  const rankList = Array.from(studentGPAMap.entries()).map(([id, data]) => {
    return { studentId: id, gpa: calculateAggregateGPA(data.gpaInputs) };
  });
  
  // Sort descending by GPA
  rankList.sort((a, b) => b.gpa - a.gpa);
  
  let rank = 0;
  for (let i = 0; i < rankList.length; i++) {
    if (rankList[i].studentId === studentId) {
      rank = i + 1;
      break;
    }
  }

  // Calculate Attendance Percentage during Term
  const attendances = await AttendanceRecord.find({
    schoolId,
    'entries.studentId': studentId,
    dateBS: { $gte: exam.startDateBS, $lte: exam.endDateBS }
  });

  let termPresent = 0;
  const termTotal = attendances.length;

  attendances.forEach(record => {
    const entry = record.entries.find(e => e.studentId.toString() === studentId);
    if (entry && (entry.status === 'PRESENT' || entry.status === 'LATE')) {
      termPresent++;
    }
  });

  const attendancePercentage = termTotal === 0 ? 0 : (termPresent / termTotal) * 100;

  return successResponse(res, {
    examName: exam.name,
    studentId,
    subjectResults,
    aggregateGPA,
    rank,
    totalStudentsInSection: rankList.length,
    attendancePercentage: attendancePercentage.toFixed(2),
    remarks: aggregateGPA >= 3.6 ? "Outstanding performance!" : aggregateGPA >= 2.4 ? "Good effort." : "Needs improvement."
  }, 'Report card generated successfully');
};
