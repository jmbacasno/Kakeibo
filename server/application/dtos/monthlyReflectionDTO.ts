import { z } from "zod";
import {
  MonthlyReflectionEntity,
  ReflectionPlanSummary,
} from "../../domain/entities/monthlyReflection/index.js";
import { PlanSummaryResult } from "../../domain/services/financialCalculator.js";

export const createReflectionSchema = z.object({
  monthlyPlanId: z.coerce.number().int().positive("Invalid monthly plan ID"),
  content: z
    .string()
    .trim()
    .min(1, "Reflection content is required")
    .max(10000, "Reflection cannot exceed 10000 characters"),
});

export const updateReflectionSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Reflection content is required")
    .max(10000, "Reflection cannot exceed 10000 characters"),
});

export const listReflectionsQuerySchema = z.object({
  planId: z.coerce.number().int().positive().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

export class MonthlyReflectionDTO {
  id!: number;
  monthlyPlanId!: number;
  content!: string;
  createdAt!: string | null;
  updatedAt!: string | null;
  monthlyPlan!: ReflectionPlanSummary | null;
  financialSummary?: PlanSummaryResult | null;

  static fromEntity(
    reflection: MonthlyReflectionEntity,
    financialSummary: PlanSummaryResult | null = null
  ): MonthlyReflectionDTO {
    return {
      id: reflection.id!,
      monthlyPlanId: reflection.monthlyPlanId,
      content: reflection.content,
      createdAt: reflection.createdAt ? reflection.createdAt.toISOString() : null,
      updatedAt: reflection.updatedAt ? reflection.updatedAt.toISOString() : null,
      monthlyPlan: reflection.monthlyPlan || null,
      ...(financialSummary ? { financialSummary } : {}),
    };
  }
}
