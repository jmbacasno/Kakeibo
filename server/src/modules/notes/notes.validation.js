import { z } from 'zod';

export const createNoteSchema = z.object({
  monthlyPlanId: z.coerce.number().int().positive('Monthly plan is required'),
  title: z.string().trim().max(120, 'Title must be 120 characters or less').optional().nullable(),
  content: z
    .string()
    .trim()
    .min(1, 'Note content is required')
    .max(5000, 'Note content is too long'),
});

export const updateNoteSchema = z.object({
  title: z.string().trim().max(120, 'Title must be 120 characters or less').optional().nullable(),
  content: z
    .string()
    .trim()
    .min(1, 'Note content is required')
    .max(5000, 'Note content is too long'),
});

export const listNotesQuerySchema = z.object({
  planId: z.coerce.number().int().positive().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  order: z.enum(['asc', 'desc']).optional().default('asc'),
});
