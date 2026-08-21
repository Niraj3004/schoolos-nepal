import { Request, Response } from 'express';
import { Parent } from './parent.model';
import { successResponse, errorResponse } from '../../utils/response';

export const getMyChildren = async (req: Request, res: Response) => {
  const schoolId = req.tenant;
  const userId = req.user?.userId;

  const parent = await Parent.findOne({ schoolId, userId })
    .populate({
      path: 'children',
      populate: [
        { path: 'currentClassId', select: 'name' },
        { path: 'currentSectionId', select: 'name' },
        { path: 'academicYearId', select: 'name' }
      ]
    });

  if (!parent) return errorResponse(res, 'NOT_FOUND', 'Parent profile not found', null, 404);

  return successResponse(res, parent.children, 'Linked children retrieved successfully');
};
