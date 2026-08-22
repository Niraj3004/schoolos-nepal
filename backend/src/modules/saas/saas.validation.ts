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

export const createPlanSchema = z.object({
  body: z.object({
    name: z.enum(['Starter', 'Growth', 'Enterprise']),
    maxStudents: z.number().int().positive(),
    priceNPRPerYear: z.number().positive(),
    features: z.array(z.string()),
    isActive: z.boolean().optional()
  })
});

export const updatePlanSchema = z.object({
  body: z.object({
    name: z.enum(['Starter', 'Growth', 'Enterprise']).optional(),
    maxStudents: z.number().int().positive().optional(),
    priceNPRPerYear: z.number().positive().optional(),
    features: z.array(z.string()).optional(),
    isActive: z.boolean().optional()
  })
});

export const updatePlatformSettingSchema = z.object({
  body: z.object({
    bankName: z.string().optional(),
    accountName: z.string().optional(),
    accountNumber: z.string().optional(),
    branch: z.string().optional(),
    supportEmail: z.string().email().optional(),
    supportPhone: z.string().optional()
  })
});
