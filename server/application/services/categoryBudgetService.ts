import { UnitOfWorkInterface } from "../../domain/repositories/unitOfWorkInterface.js";
import {
  bulkUpdateBudgetsSchema,
  CategoryBudgetDTO,
  singleBudgetSchema,
} from "../dtos/categoryBudgetDTO.js";
import { MonthlyPlanDTO } from "../dtos/monthlyPlanDTO.js";
import { NotFoundError, ValidationError } from "../errors.js";
import { parseDTO } from "../validation.js";

export class CategoryBudgetService {
  constructor(private readonly uow: UnitOfWorkInterface) {}

  async getPlanBudgets(userId: number, planId: number): Promise<CategoryBudgetDTO[]> {
    const plan = await this.uow.monthlyPlans.findByIdAndUserId(planId, userId);
    if (!plan) {
      throw new NotFoundError("Monthly plan not found.");
    }
    return (plan.budgets || []).map((b) => CategoryBudgetDTO.fromEntity(b));
  }

  async replacePlanBudgets(
    userId: number,
    planId: number,
    rawData: unknown
  ): Promise<MonthlyPlanDTO> {
    const input = parseDTO(bulkUpdateBudgetsSchema, rawData);

    const updatedPlan = await this.uow.runInTransaction(async (txUow) => {
      const plan = await txUow.monthlyPlans.findByIdAndUserId(planId, userId);
      if (!plan) {
        throw new NotFoundError("Monthly plan not found.");
      }

      const dedupedMap = new Map<number, number>();
      for (const item of input.budgets) {
        dedupedMap.set(item.categoryId, item.allocatedAmount);
      }

      const categoryIds = [...dedupedMap.keys()];
      if (categoryIds.length > 0) {
        const ownedCategories = await txUow.categories.findManyByIdsAndUserId(categoryIds, userId);
        if (ownedCategories.length !== categoryIds.length) {
          throw new ValidationError("One or more selected categories do not belong to your account.");
        }
        const nonExpense = ownedCategories.find((c) => c.type !== "EXPENSE");
        if (nonExpense) {
          throw new ValidationError(
            `Category "${nonExpense.name}" is an income category and cannot receive an expense budget.`
          );
        }
      }

      for (const [categoryId, allocatedAmount] of dedupedMap.entries()) {
        await txUow.categoryBudgets.upsert(planId, categoryId, allocatedAmount);
      }

      const fullPlan = await txUow.monthlyPlans.findByIdAndUserId(planId, userId);
      if (!fullPlan) {
        throw new NotFoundError("Monthly plan not found.");
      }
      return fullPlan;
    });

    return MonthlyPlanDTO.fromEntity(updatedPlan);
  }

  async upsertSingleBudget(
    userId: number,
    planId: number,
    categoryId: number,
    rawData: unknown
  ): Promise<CategoryBudgetDTO> {
    const input = parseDTO(singleBudgetSchema, rawData);

    const plan = await this.uow.monthlyPlans.findByIdAndUserId(planId, userId);
    if (!plan) {
      throw new NotFoundError("Monthly plan not found.");
    }

    const category = await this.uow.categories.findByIdAndUserId(categoryId, userId);
    if (!category) {
      throw new NotFoundError("Category not found.");
    }
    if (category.type !== "EXPENSE") {
      throw new ValidationError("Budgets can only be allocated to expense categories.");
    }

    const saved = await this.uow.categoryBudgets.upsert(planId, categoryId, input.allocatedAmount);
    return CategoryBudgetDTO.fromEntity(saved);
  }
}
