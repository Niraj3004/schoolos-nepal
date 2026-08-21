import { Request, Response } from 'express';
import { getAdminDashboardMetrics, getTeacherWorkloadMetrics } from './analytics.service';
import { AuditLog } from './auditLog.model';
import { AcademicYear } from '../academic/academicYear.model';
import { successResponse, errorResponse } from '../../utils/response';
import mongoose from 'mongoose';

const getNepaliDateString = (): string => {
  // Normally we would use the bsToAd/adToBs utility here to get today's BS date
  // For the sake of this endpoint, we'll assume the client can optionally pass ?todayBS=2083-05-12
  return "2083-05-12"; 
};

export const getAdminDashboard = async (req: Request, res: Response) => {
  const schoolId = new mongoose.Types.ObjectId(req.tenant as string);
  const todayBS = req.query.todayBS as string || getNepaliDateString();

  const currentYear = await AcademicYear.findOne({ schoolId, isCurrent: true });
  if (!currentYear) return errorResponse(res, 'BAD_REQUEST', 'No active academic year found', null, 400);

  const metrics = await getAdminDashboardMetrics(schoolId, currentYear._id, todayBS);

  return successResponse(res, metrics, 'Admin dashboard metrics retrieved');
};

export const getTeacherWorkload = async (req: Request, res: Response) => {
  const schoolId = new mongoose.Types.ObjectId(req.tenant as string);

  const currentYear = await AcademicYear.findOne({ schoolId, isCurrent: true });
  if (!currentYear) return errorResponse(res, 'BAD_REQUEST', 'No active academic year found', null, 400);

  const workload = await getTeacherWorkloadMetrics(schoolId, currentYear._id);

  return successResponse(res, workload, 'Teacher workload metrics retrieved');
};

export const getAuditLogs = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const { page = 1, limit = 50, action } = req.query;

  const query: any = { schoolId };
  if (action) query.action = action;

  const logs = await AuditLog.find(query)
    .populate('userId', 'email role name')
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));
    
  const total = await AuditLog.countDocuments(query);

  return successResponse(res, { logs, total, page: Number(page) }, 'Audit logs retrieved');
};
