import { CategoryEntity } from "../category/index.js";
import { validateBudgetAmount } from "./validators.js";

export interface CategoryBudgetEntity {
  id: number | null;
  monthlyPlanId: number;
  categoryId: number;
  allocatedAmount: number;
  createdAt: Date | null;
  updatedAt: Date | null;
  category?: CategoryEntity | null;
}

export class CategoryBudget implements CategoryBudgetEntity {
  id: number | null;
  monthlyPlanId: number;
  categoryId: number;
  allocatedAmount: number;
  createdAt: Date | null;
  updatedAt: Date | null;
  category?: CategoryEntity | null;

  constructor(data: CategoryBudgetEntity) {
    this.id = data.id;
    this.monthlyPlanId = data.monthlyPlanId;
    this.categoryId = data.categoryId;
    this.allocatedAmount = data.allocatedAmount;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.category = data.category;

    this.validate();
  }

  validate(): void {
    validateBudgetAmount(this.allocatedAmount);
  }
}
