import { z } from 'zod';

export const createExamSchema = z.object({
  body: z.object({
    academicYearId: z.string(),
    termId: z.string(),
    name: z.string(),
    startDateBS: z.string(),
    endDateBS: z.string(),
    isPublished: z.boolean().optional()
  })
});

export const bulkMarkEntrySchema = z.object({
  body: z.object({
    examId: z.string(),
    classId: z.string(),
    sectionId: z.string(),
    subjectId: z.string(),
    marks: z.array(z.object({
      studentId: z.string(),
      theoryMarksObtained: z.number().min(0).optional(),
      practicalMarksObtained: z.number().min(0).optional(),
      isAbsent: z.boolean().optional()
    })).min(1)
  })
});
