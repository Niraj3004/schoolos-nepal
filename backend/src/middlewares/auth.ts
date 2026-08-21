import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.config';
import { errorResponse } from '../utils/response';

interface JwtPayload {
  userId: string;
  role: string;
  schoolId: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      tenant?: string;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'UNAUTHORIZED', 'No access token provided', null, 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch (error) {
    return errorResponse(res, 'UNAUTHORIZED', 'Invalid or expired access token', null, 401);
  }
};
