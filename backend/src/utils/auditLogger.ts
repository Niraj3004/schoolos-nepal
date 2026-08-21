import { Request } from 'express';
import { AuditLog } from '../modules/analytics/auditLog.model';

export const logAudit = (req: Request, action: string, details: any = {}) => {
  // Fire and forget, we don't await this so it doesn't block the request response cycle
  try {
    const schoolId = req.tenant;
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

    if (schoolId && userId) {
      AuditLog.create({
        schoolId,
        userId,
        userRole,
        action,
        ipAddress,
        details
      }).catch(err => {
        console.error('Failed to write audit log asynchronously:', err);
      });
    }
  } catch (error) {
    console.error('Failed to construct audit log payload:', error);
  }
};
