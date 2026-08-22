import { z } from 'zod';

export const createTeacherSchema = z.object({
  body: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    employeeId: z.string().min(1),
    phone: z.string().min(10),
    department: z.string().default('ACADEMIC'),
    designation: z.string().default('TEACHER'),
    address: z.string().optional(),
    joinDateBS: z.string().optional(),
  })
});

export const updateTeacherSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z.string().min(10).optional(),
    department: z.string().optional(),
    designation: z.string().optional(),
    address: z.string().optional(),
    joinDateBS: z.string().optional(),
    status: z.enum(['ACTIVE', 'ON_LEAVE', 'TERMINATED']).optional(),
  })
});
