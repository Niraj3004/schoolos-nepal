import { z } from 'zod';

export const enrollStudentSchema = z.object({
  body: z.object({
    admissionNumber: z.string(),
    rollNumber: z.number().int().optional().or(z.string().regex(/^\d+$/).transform(Number).optional()),
    currentClassId: z.string(),
    currentSectionId: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    dobBS: z.string().optional(),
    dobAD: z.string().datetime().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    bloodGroup: z.string().optional(),
    address: z.string().optional(),
    houseId: z.string().optional(),
    emergencyContact: z.string().optional(),
    fatherName: z.string().optional(),
    motherName: z.string().optional(),
    primaryPhone: z.string(),
    secondaryPhone: z.string().optional(),
    parentOccupation: z.string().optional(),
    parentAddress: z.string().optional()
  })
});

export const bulkEnrollSchema = z.object({
  body: z.object({
    students: z.array(z.any())
  })
});
