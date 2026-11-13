import { MonthlyPlanEntity, PlanStatus } from "../entities/monthlyPlan/index.js";

export interface AvailablePlanPeriod {
  id: number;
  month: number;
  year: number;
  status: string;
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
    status: PlanStatus;
  }): Promise<MonthlyPlanEntity>;
  update(
    id: number,
    data: {
      plannedIncome?: number;
      savingsGoal?: number;
      status?: PlanStatus;
    }
  ): Promise<MonthlyPlanEntity>;
  updateStatus(id: number, status: PlanStatus): Promise<MonthlyPlanEntity>;
}
