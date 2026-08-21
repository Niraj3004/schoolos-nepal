import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';

export const requireTenant = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return errorResponse(res, 'UNAUTHORIZED', 'User not authenticated', null, 401);
  }

  if (req.user.role === 'SUPERADMIN') {
    // SUPERADMIN can operate globally, or we could expect a schoolId header
    return next();
  }

  if (!req.user.schoolId) {
    return errorResponse(res, 'FORBIDDEN', 'User is not associated with any tenant', null, 403);
  }

  req.tenant = req.user.schoolId;
  next();
};
