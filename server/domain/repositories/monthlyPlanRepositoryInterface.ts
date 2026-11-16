import { MonthlyPlanEntity } from "../entities/monthlyPlan/index.js";

export interface AvailablePlanPeriod {
  id: number;
  month: number;
  year: number;
}

export interface MonthlyPlanRepositoryInterface {
  findAllByUserId(userId: number): Promise<MonthlyPlanEntity[]>;
  findAvailablePeriodsByUserId(userId: number): Promise<AvailablePlanPeriod[]>;
  findByIdAndUserId(id: number, userId: number): Promise<MonthlyPlanEntity | null>;
  findByPeriodAndUserId(
    month: number,
    year: number,
    userId: number
  ): Promise<MonthlyPlanEntity | null>;
  create(data: {
    userId: number;
    month: number;
    year: number;
    plannedIncome: number;
    savingsGoal: number;
  }): Promise<MonthlyPlanEntity>;
  update(
    id: number,
    data: {
      plannedIncome?: number;
      savingsGoal?: number;
    }
  ): Promise<MonthlyPlanEntity>;
}
