import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return errorResponse(res, 'UNAUTHORIZED', 'User not authenticated', null, 401);
    }
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 'FORBIDDEN', 'You do not have permission to access this resource', null, 403);
    }
    next();
  };
};
