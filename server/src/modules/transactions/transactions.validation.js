import { z } from 'zod';

const dateStringSchema = z
  .string()
  .trim()
  .refine((val) => !Number.isNaN(Date.parse(val)), 'Please enter a valid transaction date');

export const createTransactionSchema = z.object({
  monthlyPlanId: z.coerce.number().int().positive('Monthly plan is required'),
  categoryId: z.coerce.number().int().positive('Category is required'),
  amount: z.coerce
    .number({ invalid_type_error: 'Amount must be a valid number' })
    .positive('Amount must be greater than zero')
    .max(999999999.99, 'Amount is too large'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(200, 'Description must be 200 characters or less'),
  transactionDate: dateStringSchema,
});

export const updateTransactionSchema = z.object({
  monthlyPlanId: z.coerce.number().int().positive().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  amount: z.coerce
    .number({ invalid_type_error: 'Amount must be a valid number' })
    .positive('Amount must be greater than zero')
    .max(999999999.99, 'Amount is too large')
    .optional(),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(200, 'Description must be 200 characters or less')
    .optional(),
  transactionDate: dateStringSchema.optional(),
});

export const listTransactionsQuerySchema = z.object({
  planId: z.coerce.number().int().positive().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
  search: z.string().trim().optional(),
  sortBy: z.enum(['date', 'amount']).optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
});
