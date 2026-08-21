import { z } from 'zod';

export const registerSchoolSchema = z.object({
  body: z.object({
    // School Details
    schoolName: z.string().min(1),
    schoolCode: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric'),
    schoolAddress: z.string().optional(),
    schoolPhone: z.string().optional(),
    
    // Admin Details
    adminEmail: z.string().email(),
    adminPassword: z.string().min(6),
    adminName: z.string().min(1),
    
    // SaaS Plan Details
    planId: z.string(),
    billingCycle: z.enum(['ANNUAL', 'SEMI_ANNUAL']),
    transactionReference: z.string().optional()
  })
});

export const reviewRequestSchema = z.object({
  body: z.object({
    status: z.enum(['ACTIVE', 'REJECTED']),
    rejectionReason: z.string().optional()
  })
});
