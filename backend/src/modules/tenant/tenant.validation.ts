import { z } from 'zod';

export const updateTenantSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    principalName: z.string().optional(),
    address: z.object({
      city: z.string().optional(),
      district: z.string().optional(),
      province: z.string().optional(),
    }).optional()
  })
});

export const createAcademicYearSchema = z.object({
  body: z.object({
    name: z.string(),
    startDateBS: z.string(),
    endDateBS: z.string(),
    startDateAD: z.string().datetime(),
    endDateAD: z.string().datetime(),
  })
});

export const createTermSchema = z.object({
  body: z.object({
    academicYearId: z.string(),
    name: z.string(),
    termOrder: z.number().int().positive(),
    startDateBS: z.string(),
    endDateBS: z.string()
  })
});

export const createHouseSchema = z.object({
  body: z.object({
    name: z.string(),
    color: z.string().optional(),
    description: z.string().optional()
  })
});
