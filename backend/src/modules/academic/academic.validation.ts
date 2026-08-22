import { z } from 'zod';

export const createAcademicYearSchema = z.object({
  body: z.object({
    name: z.string(),
    startDateBS: z.string(),
    endDateBS: z.string(),
    isCurrent: z.boolean().optional()
  })
});

export const createTermSchema = z.object({
  body: z.object({
    academicYearId: z.string(),
    name: z.string(),
    termOrder: z.number().int(),
    startDateBS: z.string(),
    endDateBS: z.string()
  })
});
export const createClassSchema = z.object({
  body: z.object({
    name: z.string(),
    numericValue: z.number().int(),
    order: z.number().int()
  })
});

export const createSectionSchema = z.object({
  body: z.object({
    classId: z.string(),
    name: z.string(),
    capacity: z.number().int().positive(),
    classTeacherId: z.string().optional()
  })
});

export const updateSectionSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    capacity: z.number().int().positive().optional(),
    classTeacherId: z.string().optional()
  })
});

export const createSubjectSchema = z.object({
  body: z.object({
    name: z.string(),
    code: z.string(),
    isOptional: z.boolean().optional(),
    creditHours: z.number().positive(),
    theoryFullMarks: z.number().min(0),
    practicalFullMarks: z.number().min(0),
    theoryPassMarks: z.number().min(0),
    practicalPassMarks: z.number().min(0)
  })
});

export const allocateSubjectSchema = z.object({
  body: z.object({
    academicYearId: z.string(),
    classId: z.string(),
    sectionId: z.string(),
    subjectId: z.string(),
    teacherId: z.string()
  })
});
