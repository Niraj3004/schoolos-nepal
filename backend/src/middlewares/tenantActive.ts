import { Request, Response, NextFunction } from 'express';
import { Tenant } from '../modules/tenant/tenant.model';
import { errorResponse } from '../utils/response';

export const requireActiveTenant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.tenant;
    
    // Superadmin bypass (just in case they hit a gated route)
    if (req.user?.role === 'SUPERADMIN') {
      return next();
    }

    if (!schoolId) {
      return errorResponse(res, 'UNAUTHORIZED', 'Missing tenant context', null, 401);
    }

    const tenant = await Tenant.findById(schoolId);
    if (!tenant) {
      return errorResponse(res, 'NOT_FOUND', 'Tenant not found', null, 404);
    }

    if (tenant.subscriptionStatus !== 'ACTIVE') {
      return errorResponse(res, 'PAYMENT_REQUIRED', 'School subscription is inactive or pending approval', null, 402);
    }

    next();
  } catch (error) {
    return errorResponse(res, 'INTERNAL_SERVER_ERROR', 'Failed to verify tenant status', null, 500);
  }
};
