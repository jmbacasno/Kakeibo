import { z } from "zod";
import { CategoryEntity, CategoryType } from "../../domain/entities/category/index.js";

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(50, "Category name is too long"),
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
});

export const updateCategoryStatusSchema = z.object({
  isActive: z.boolean({ error: "isActive boolean is required" }),
});

export const listCategoriesQuerySchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

export class CategoryDTO {
  id!: number;
  userId!: number;
  name!: string;
  type!: CategoryType;
  isDefault!: boolean;
  isActive!: boolean;
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
      type: category.type,
      isDefault: category.isDefault,
      isActive: category.isActive,
      createdAt: category.createdAt ? category.createdAt.toISOString() : null,
      updatedAt: category.updatedAt ? category.updatedAt.toISOString() : null,
      ...(category._count ? { _count: category._count } : {}),
    };
  }
}
