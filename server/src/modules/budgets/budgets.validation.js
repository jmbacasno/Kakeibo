import { z } from 'zod';

const moneySchema = z.coerce
  .number({ invalid_type_error: 'Allocated amount must be a valid number' })
  .min(0, 'Allocated amount cannot be negative')
  .max(999999999.99, 'Allocated amount is too large');

export const bulkUpdateBudgetsSchema = z.object({
  budgets: z.array(
    z.object({
      categoryId: z.coerce.number().int().positive('Invalid category ID'),
      allocatedAmount: moneySchema,
    })
  ),
});

export const singleBudgetSchema = z.object({
  allocatedAmount: moneySchema,
});
