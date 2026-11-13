import { CategoryBudgetEntity } from "../entities/categoryBudget/index.js";

export interface CategoryBudgetRepositoryInterface {
  upsert(
    monthlyPlanId: number,
    categoryId: number,
    allocatedAmount: number
  ): Promise<CategoryBudgetEntity>;
}
