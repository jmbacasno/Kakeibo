import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required').max(50, 'Category name is too long'),
  type: z.enum(['INCOME', 'EXPENSE'], {
    errorMap: () => ({ message: 'Category type must be INCOME or EXPENSE' }),
  }),
});

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required').max(50, 'Category name is too long'),
});

export const updateCategoryStatusSchema = z.object({
  isActive: z.boolean({ required_error: 'isActive boolean is required' }),
});

export const listCategoriesQuerySchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});
