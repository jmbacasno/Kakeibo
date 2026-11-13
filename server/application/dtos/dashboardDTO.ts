import { z } from "zod";
import { PlanStatus } from "../../domain/entities/monthlyPlan/index.js";
import { PlanSummaryResult } from "../../domain/services/financialCalculator.js";
import { MonthlyPlanDTO } from "./monthlyPlanDTO.js";
import { TransactionDTO } from "./transactionDTO.js";

export const dashboardQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

export interface AvailableMonthItemDTO {
  id: number;
  month: number;
  year: number;
  status: PlanStatus;
}

export interface DashboardDTO {
  month: number;
  year: number;
  hasPlan: boolean;
  plan: MonthlyPlanDTO | null;
  summary: PlanSummaryResult | null;
  recentTransactions: TransactionDTO[];
  availableMonths: AvailableMonthItemDTO[];
}
