import { z } from 'zod';

export const submitAttendanceSchema = z.object({
  body: z.object({
    academicYearId: z.string(),
    classId: z.string(),
    sectionId: z.string(),
    dateBS: z.string(),
    dateAD: z.string().datetime(),
    type: z.enum(['DAILY', 'SUBJECT_WISE']),
    subjectId: z.string().nullable().optional(),
    entries: z.array(z.object({
      studentId: z.string(),
      status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
      remarks: z.string().optional()
    })).min(1)
  })
});
