import { z } from 'zod';

export const createHomeworkSchema = z.object({
  body: z.object({
    academicYearId: z.string(),
    classId: z.string(),
    sectionId: z.string(),
    subjectId: z.string(),
    title: z.string(),
    description: z.string(),
    assignedDateBS: z.string(),
    dueDateBS: z.string(),
    dueDateAD: z.string().datetime()
  })
});

export const evaluateSubmissionSchema = z.object({
  body: z.object({
    status: z.enum(['SUBMITTED', 'LATE', 'EVALUATED', 'RESUBMIT']),
    feedback: z.string().optional(),
    marksObtained: z.number().min(0).optional()
  })
});

export const createMaterialSchema = z.object({
  body: z.object({
    classId: z.string(),
    subjectId: z.string(),
    title: z.string(),
    description: z.string().optional(),
    fileType: z.enum(['PDF', 'IMAGE', 'DOC']),
    tags: z.preprocess((val) => {
      if (typeof val === 'string') {
        try {
          return JSON.parse(val);
        } catch (e) {
          return val.split(',').map(s => s.trim());
        }
      }
      return val;
    }, z.array(z.string()).optional())
  })
});
