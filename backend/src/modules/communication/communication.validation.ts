import { z } from 'zod';

export const createNoticeSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    targetAudience: z.array(z.enum(['ALL', 'TEACHERS', 'STUDENTS', 'PARENTS', 'GRADE_SPECIFIC'])).min(1),
    targetClassIds: z.array(z.string()).optional(),
    isUrgent: z.boolean().optional(),
    expiresAtBS: z.string().optional()
  })
});

export const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    eventType: z.enum(['HOLIDAY', 'EXAM', 'EVENT', 'MEETING', 'SPORTS']),
    startDateBS: z.string(),
    endDateBS: z.string(),
    startDateAD: z.string().datetime(),
    endDateAD: z.string().datetime(),
    isHoliday: z.boolean().optional()
  })
});
