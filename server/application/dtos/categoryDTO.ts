import { z } from "zod";
import { CategoryEntity, CategoryType } from "../../domain/entities/category/index.js";

const optionalDescriptionSchema = z
  .string()
  .trim()
  .max(255, "Category description cannot exceed 255 characters")
  .optional()
  .nullable()
  .transform((val) => (val && val.trim().length > 0 ? val.trim() : null));

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(50, "Category name is too long"),
  description: optionalDescriptionSchema,
  type: z.enum(["INCOME", "EXPENSE"], {
    error: "Category type must be INCOME or EXPENSE",
  }),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(50, "Category name is too long"),
  description: optionalDescriptionSchema,
});

export const listCategoriesQuerySchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
});

export class CategoryDTO {
  id!: number;
  userId!: number;
  name!: string;
  description!: string | null;
  type!: CategoryType;
  createdAt!: string | null;
  updatedAt!: string | null;
  _count?: {
    transactions: number;
    categoryBudgets: number;
  };

  static fromEntity(category: CategoryEntity): CategoryDTO {
    return {
      id: category.id!,
      userId: category.userId,
      name: category.name,
      description: category.description,
      type: category.type,
      createdAt: category.createdAt ? category.createdAt.toISOString() : null,
      updatedAt: category.updatedAt ? category.updatedAt.toISOString() : null,
      ...(category._count ? { _count: category._count } : {}),
    };
  }
}
