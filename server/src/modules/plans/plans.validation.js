import { z } from 'zod';

const moneySchema = z.coerce
  .number({ invalid_type_error: 'Amount must be a valid number' })
  .min(0, 'Amount cannot be negative')
  .max(999999999.99, 'Amount is too large');

const budgetItemSchema = z.object({
  categoryId: z.coerce.number().int().positive('Invalid category ID'),
  allocatedAmount: moneySchema,
});

export const createPlanSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
  plannedIncome: moneySchema,
  savingsGoal: moneySchema,
  status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED']).optional().default('ACTIVE'),
  budgets: z.array(budgetItemSchema).optional().default([]),
});

export const updatePlanSchema = z.object({
  plannedIncome: moneySchema.optional(),
  savingsGoal: moneySchema.optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED']).optional(),
  budgets: z.array(budgetItemSchema).optional(),
});

export const updatePlanStatusSchema = z.object({
  status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED']),
});

export const currentPlanQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});
