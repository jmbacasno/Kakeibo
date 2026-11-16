import { MonthlyPlan as PrismaMonthlyPlan } from "@prisma/client";
import { MonthlyPlan } from "../../../../domain/entities/monthlyPlan/index.js";
import {
  CategoryBudgetMapper,
  PrismaCategoryBudgetWithCategory,
} from "./categoryBudgetMapper.js";
import {
  PrismaTransactionWithRelations,
  TransactionMapper,
} from "./transactionMapper.js";

export type PrismaMonthlyPlanWithRelations = PrismaMonthlyPlan & {
  budgets?: PrismaCategoryBudgetWithCategory[];
  transactions?: PrismaTransactionWithRelations[];
};

export class MonthlyPlanMapper {
  static toEntity(raw: PrismaMonthlyPlanWithRelations): MonthlyPlan {
    return new MonthlyPlan({
      id: raw.id,
      userId: raw.userId,
      month: raw.month,
      year: raw.year,
      plannedIncome: Number(raw.plannedIncome),
      savingsGoal: Number(raw.savingsGoal),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      budgets: raw.budgets ? raw.budgets.map(CategoryBudgetMapper.toEntity) : [],
      transactions: raw.transactions ? raw.transactions.map(TransactionMapper.toEntity) : [],
    });
  }
}
