import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { errorResponse } from '../utils/response';

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  // Zod Validation Error
  if (err instanceof ZodError) {
    return errorResponse(res, 'VALIDATION_ERROR', 'Invalid data provided', err.issues, 400);
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return errorResponse(res, 'INVALID_ID', `Invalid ${err.path}: ${err.value}`, null, 400);
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return errorResponse(res, 'CONFLICT', `${field} already exists.`, null, 409);
  }

  // Default fallback
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  return errorResponse(res, 'SERVER_ERROR', message, null, statusCode);
};
