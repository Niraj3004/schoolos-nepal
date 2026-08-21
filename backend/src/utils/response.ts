import { Response } from 'express';

export const successResponse = (res: Response, data: any = null, message: string = 'Success', statusCode: number = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

export const errorResponse = (
  res: Response,
  code: string,
  message: string,
  details: any = null,
  statusCode: number = 400
) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
  });
};
