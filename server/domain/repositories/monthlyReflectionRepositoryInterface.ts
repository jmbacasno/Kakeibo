import { MonthlyReflectionEntity } from "../entities/monthlyReflection/index.js";

export interface ReflectionFilterParams {
  planId?: number;
  month?: number;
  year?: number;
}

export interface MonthlyReflectionRepositoryInterface {
  findManyByUserId(
    userId: number,
    filters: ReflectionFilterParams
  ): Promise<MonthlyReflectionEntity[]>;
  findByIdAndUserId(id: number, userId: number): Promise<MonthlyReflectionEntity | null>;
  findByPlanId(monthlyPlanId: number): Promise<MonthlyReflectionEntity | null>;
  create(data: { monthlyPlanId: number; content: string }): Promise<MonthlyReflectionEntity>;
  update(id: number, content: string): Promise<MonthlyReflectionEntity>;
  delete(id: number): Promise<void>;
}
