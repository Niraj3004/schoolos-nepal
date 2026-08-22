import mongoose from 'mongoose';
import { User } from '../auth/user.model';
import { Student } from '../student/student.model';
import { StudentInvoice } from '../finance/finance.model';
import { AttendanceRecord } from '../attendance/attendance.model';
import { SubjectAllocation } from '../academic/subjectAllocation.model';
import { Homework } from '../homework/homework.model';
import { Exam } from '../exam/exam.model';
import { Staff } from '../staff/staff.model';

export const getAdminDashboardMetrics = async (schoolId: mongoose.Types.ObjectId, currentAcademicYearId: mongoose.Types.ObjectId, todayBS: string) => {
  // Using multiple parallel queries instead of one massive facet due to different base collections
  
  // 1. Demographics
  const studentCount = await Student.countDocuments({ schoolId, academicYearId: currentAcademicYearId, status: 'ENROLLED' });
  const teacherCount = await User.countDocuments({ schoolId, role: 'TEACHER', isActive: true });
  const parentCount = await User.countDocuments({ schoolId, role: 'PARENT', isActive: true });
  
  // 2. Financial Liquidity
  const financialAggregation = await StudentInvoice.aggregate([
    { $match: { schoolId, academicYearId: currentAcademicYearId } },
    { $group: {
        _id: null,
        totalBilled: { $sum: '$totalPayable' },
        totalCollected: { $sum: '$paidAmount' },
        pendingVerificationSlips: {
          $sum: { $cond: [{ $eq: ['$status', 'PENDING_VERIFICATION'] }, 1, 0] }
        }
      }
    }
  ]);
  const finance = financialAggregation[0] || { totalBilled: 0, totalCollected: 0, pendingVerificationSlips: 0 };
  const totalPending = finance.totalBilled - finance.totalCollected;

  // 3. Daily Attendance Pulse (Class-wise)
  const attendancePulse = await AttendanceRecord.aggregate([
    { $match: { schoolId, dateBS: todayBS, type: 'DAILY' } },
    { $unwind: '$entries' },
    { $group: {
        _id: '$classId',
        totalStudents: { $sum: 1 },
        presentCount: { $sum: { $cond: [{ $eq: ['$entries.status', 'PRESENT'] }, 1, 0] } },
        absentCount: { $sum: { $cond: [{ $eq: ['$entries.status', 'ABSENT'] }, 1, 0] } }
      }
    },
    { $lookup: { from: 'classes', localField: '_id', foreignField: '_id', as: 'classInfo' } },
    { $unwind: '$classInfo' },
    { $project: {
        className: '$classInfo.name',
        totalStudents: 1,
        presentCount: 1,
        absentCount: 1,
        attendancePercentage: { $multiply: [{ $divide: ['$presentCount', '$totalStudents'] }, 100] }
      }
    }
  ]);

  // 4. Academic Performance Trends
  const recentExams = await Exam.find({ schoolId, academicYearId: currentAcademicYearId, isPublished: true }).select('name').limit(3).sort({ createdAt: -1 });

  return {
    demographics: {
      totalStudents: studentCount,
      totalTeachers: teacherCount,
      totalParents: parentCount,
      studentTeacherRatio: teacherCount > 0 ? (studentCount / teacherCount).toFixed(2) : 'N/A'
    },
    finance: {
      totalBilled: finance.totalBilled,
      totalCollected: finance.totalCollected,
      totalPending,
      pendingVerificationSlips: finance.pendingVerificationSlips
    },
    attendancePulse,
    recentExams
  };
};

export const getTeacherWorkloadMetrics = async (schoolId: mongoose.Types.ObjectId, currentAcademicYearId: mongoose.Types.ObjectId) => {
  const workload = await SubjectAllocation.aggregate([
    { $match: { schoolId, academicYearId: currentAcademicYearId } },
    { $group: {
        _id: '$teacherId',
        assignedClassesCount: { $sum: 1 },
        subjects: { $push: '$subjectId' }
      }
    },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'teacherInfo' } },
    { $unwind: '$teacherInfo' },
    { $project: {
        teacherName: '$teacherInfo.name',
        assignedClassesCount: 1
      }
    }
  ]);

  return workload;
};

export const getTeacherDashboardMetrics = async (schoolId: mongoose.Types.ObjectId, currentAcademicYearId: mongoose.Types.ObjectId, teacherUserId: string) => {
  const teacherObjectId = new mongoose.Types.ObjectId(teacherUserId);

  // 1. Get the staff record for homework lookup (teacherId in Homework refs Staff._id)
  const staffRecord = await Staff.findOne({ schoolId, userId: teacherObjectId });

  // 2. My allocations — SubjectAllocation.teacherId refs User._id directly
  const allocations = await SubjectAllocation.find({
    schoolId,
    academicYearId: currentAcademicYearId,
    teacherId: teacherObjectId,
  }).populate('classId', 'name').populate('sectionId', 'name').populate('subjectId', 'name');

  // Unique classes
  const classMap = new Map();
  allocations.forEach((a: any) => {
    if (a.classId) classMap.set(a.classId._id.toString(), a.classId);
  });
  const uniqueClasses = Array.from(classMap.values());
  const classIds = Array.from(classMap.keys()).map(id => new mongoose.Types.ObjectId(id));

  // 3. Total students across my classes
  const totalStudents = classIds.length > 0 ? await Student.countDocuments({
    schoolId,
    academicYearId: currentAcademicYearId,
    currentClassId: { $in: classIds },
    status: 'ENROLLED'
  }) : 0;

  // 4. Homework (teacherId in Homework refs Staff._id)
  let pendingHomework = 0;
  let totalHomework = 0;
  let recentHomework: any[] = [];

  if (staffRecord) {
    pendingHomework = await Homework.countDocuments({
      schoolId,
      teacherId: staffRecord._id,
      dueDate: { $gte: new Date() }
    });
    totalHomework = await Homework.countDocuments({ schoolId, teacherId: staffRecord._id });
    recentHomework = await Homework.find({ schoolId, teacherId: staffRecord._id })
      .populate('classId', 'name')
      .populate('subjectId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);
  }

  // 5. Upcoming exams
  const upcomingExams = await Exam.find({
    schoolId,
    academicYearId: currentAcademicYearId,
    isPublished: false
  }).select('name startDateBS endDateBS').limit(5).sort({ createdAt: -1 });

  return {
    classes: uniqueClasses,
    totalClasses: uniqueClasses.length,
    totalStudents,
    totalSubjects: allocations.length,
    pendingHomework,
    totalHomework,
    upcomingExams,
    recentHomework,
    allocations
  };
};
