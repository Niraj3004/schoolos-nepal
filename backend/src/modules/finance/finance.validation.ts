import { z } from 'zod';

export const createFeeHeadSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    type: z.enum(['MONTHLY', 'ONE_TIME', 'TERM_WISE'])
  })
});

export const createFeeStructureSchema = z.object({
  body: z.object({
    academicYearId: z.string(),
    classId: z.string(),
    items: z.array(z.object({
      feeHeadId: z.string(),
      amount: z.number().min(0)
    })).min(1)
  })
});

export const generateMonthlyInvoicesSchema = z.object({
  body: z.object({
    academicYearId: z.string(),
    classId: z.string(),
    monthBS: z.string(),
    dueDateBS: z.string(),
    discounts: z.record(z.string(), z.number().min(0)).optional() // Record of studentId -> discountAmount
  })
});

export const verifySlipSchema = z.object({
  body: z.object({
    status: z.enum(['APPROVED', 'REJECTED']),
    rejectionReason: z.string().optional()
  })
});
