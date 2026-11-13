import { z } from 'zod';

export const createReflectionSchema = z.object({
  monthlyPlanId: z.coerce.number().int().positive('Monthly plan is required'),
  content: z
    .string()
    .trim()
    .min(1, 'Reflection content cannot be empty')
    .max(10000, 'Reflection content is too long'),
});

export const updateReflectionSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Reflection content cannot be empty')
    .max(10000, 'Reflection content is too long'),
});

export const listReflectionsQuerySchema = z.object({
  planId: z.coerce.number().int().positive().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});
