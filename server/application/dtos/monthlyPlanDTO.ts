import { z } from "zod";
import { MonthlyPlanEntity } from "../../domain/entities/monthlyPlan/index.js";
import {
  calculatePlanSummary,
  PlanSummaryResult,
  toMoneyNumber,
} from "../../domain/services/financialCalculator.js";
import { CategoryDTO } from "./categoryDTO.js";

const moneySchema = z.coerce
  .number({ error: "Amount must be a valid number" })
  .min(0, "Amount cannot be negative")
  .max(999999999.99, "Amount is too large");

const budgetItemSchema = z.object({
  categoryId: z.coerce.number().int().positive("Invalid category ID"),
  allocatedAmount: moneySchema,
});

export const createPlanSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
  plannedIncome: moneySchema,
  savingsGoal: moneySchema,
  budgets: z.array(budgetItemSchema).optional().default([]),
});

export const updatePlanSchema = z.object({
  plannedIncome: moneySchema.optional(),
  savingsGoal: moneySchema.optional(),
  budgets: z.array(budgetItemSchema).optional(),
});

export const currentPlanQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

export interface PlanBudgetItemDTO {
  id: number;
  monthlyPlanId: number;
  categoryId: number;
  allocatedAmount: number;
  category: CategoryDTO | null;
}

export class MonthlyPlanDTO {
  id!: number;
  userId!: number;
  month!: number;
  year!: number;
  plannedIncome!: number;
  savingsGoal!: number;
  createdAt!: string | null;
  updatedAt!: string | null;
  budgets!: PlanBudgetItemDTO[];
  summary!: PlanSummaryResult;

  static fromEntity(plan: MonthlyPlanEntity): MonthlyPlanDTO {
    const summary = calculatePlanSummary(
      plan.plannedIncome,
      plan.savingsGoal,
      plan.budgets || [],
      plan.transactions || []
    );

    return {
      id: plan.id!,
      userId: plan.userId,
      month: plan.month,
      year: plan.year,
      plannedIncome: toMoneyNumber(plan.plannedIncome),
      savingsGoal: toMoneyNumber(plan.savingsGoal),
      createdAt: plan.createdAt ? plan.createdAt.toISOString() : null,
      updatedAt: plan.updatedAt ? plan.updatedAt.toISOString() : null,
      budgets: (plan.budgets || []).map((b) => ({
        id: b.id!,
        monthlyPlanId: b.monthlyPlanId,
        categoryId: b.categoryId,
        allocatedAmount: toMoneyNumber(b.allocatedAmount),
        category: b.category ? CategoryDTO.fromEntity(b.category) : null,
      })),
      summary,
    };
  }
}
