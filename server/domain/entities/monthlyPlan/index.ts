import { CategoryEntity } from "../category/index.js";
import { CategoryBudgetEntity } from "../categoryBudget/index.js";
import { TransactionEntity } from "../transaction/index.js";
import {
  validateNonNegativeAmount,
  validatePlanMonth,
  validatePlanStatus,
  validatePlanYear,
} from "./validators.js";

export type PlanStatus = "DRAFT" | "ACTIVE" | "COMPLETED";

export interface MonthlyPlanBudgetRelation extends CategoryBudgetEntity {
  category?: CategoryEntity | null;
}

export interface MonthlyPlanTransactionRelation extends TransactionEntity {
  category?: CategoryEntity | null;
}

export interface MonthlyPlanEntity {
  id: number | null;
  userId: number;
  month: number;
  year: number;
  plannedIncome: number;
  savingsGoal: number;
  status: PlanStatus;
  createdAt: Date | null;
  updatedAt: Date | null;
  budgets?: MonthlyPlanBudgetRelation[];
  transactions?: MonthlyPlanTransactionRelation[];
}

export class MonthlyPlan implements MonthlyPlanEntity {
  id: number | null;
  userId: number;
  month: number;
  year: number;
  plannedIncome: number;
  savingsGoal: number;
  status: PlanStatus;
  createdAt: Date | null;
  updatedAt: Date | null;
  budgets?: MonthlyPlanBudgetRelation[];
  transactions?: MonthlyPlanTransactionRelation[];

  constructor(data: MonthlyPlanEntity) {
    this.id = data.id;
    this.userId = data.userId;
    this.month = data.month;
    this.year = data.year;
    this.plannedIncome = data.plannedIncome;
    this.savingsGoal = data.savingsGoal;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.budgets = data.budgets;
    this.transactions = data.transactions;

    this.validate();
  }

  validate(): void {
    validatePlanMonth(this.month);
    validatePlanYear(this.year);
    validateNonNegativeAmount(this.plannedIncome, "Planned income");
    validateNonNegativeAmount(this.savingsGoal, "Savings goal");
    validatePlanStatus(this.status);
  }
}
