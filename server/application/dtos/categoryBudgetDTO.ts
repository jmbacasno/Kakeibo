import { z } from "zod";
import { CategoryBudgetEntity } from "../../domain/entities/categoryBudget/index.js";
import { toMoneyNumber } from "../../domain/services/financialCalculator.js";
import { CategoryDTO } from "./categoryDTO.js";

const moneySchema = z.coerce
  .number({ error: "Allocated amount must be a valid number" })
  .min(0, "Allocated amount cannot be negative")
  .max(999999999.99, "Allocated amount is too large");

export const bulkUpdateBudgetsSchema = z.object({
  budgets: z.array(
    z.object({
      categoryId: z.coerce.number().int().positive("Invalid category ID"),
      allocatedAmount: moneySchema,
    })
  ),
});

export const singleBudgetSchema = z.object({
  allocatedAmount: moneySchema,
});

export class CategoryBudgetDTO {
  id!: number;
  monthlyPlanId!: number;
  categoryId!: number;
  allocatedAmount!: number;
  createdAt!: string | null;
  updatedAt!: string | null;
  category!: CategoryDTO | null;

  static fromEntity(budget: CategoryBudgetEntity): CategoryBudgetDTO {
    return {
      id: budget.id!,
      monthlyPlanId: budget.monthlyPlanId,
      categoryId: budget.categoryId,
      allocatedAmount: toMoneyNumber(budget.allocatedAmount),
      createdAt: budget.createdAt ? budget.createdAt.toISOString() : null,
      updatedAt: budget.updatedAt ? budget.updatedAt.toISOString() : null,
      category: budget.category ? CategoryDTO.fromEntity(budget.category) : null,
    };
  }
}
