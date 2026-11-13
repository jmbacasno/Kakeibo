import { PlanStatus } from "../../domain/entities/monthlyPlan/index.js";
import { UnitOfWorkInterface } from "../../domain/repositories/unitOfWorkInterface.js";
import { PlanSummaryResult } from "../../domain/services/financialCalculator.js";
import {
  createPlanSchema,
  currentPlanQuerySchema,
  MonthlyPlanDTO,
  updatePlanSchema,
  updatePlanStatusSchema,
} from "../dtos/monthlyPlanDTO.js";
import { ConflictError, NotFoundError, ValidationError } from "../errors.js";
import { parseDTO } from "../validation.js";

export class MonthlyPlanService {
  constructor(private readonly uow: UnitOfWorkInterface) {}

  private async validateExpenseBudgetCategories(
    txUow: UnitOfWorkInterface,
    userId: number,
    budgets: Array<{ categoryId: number; allocatedAmount: number }>
  ): Promise<Array<{ categoryId: number; allocatedAmount: number }>> {
    if (budgets.length === 0) return [];

    const dedupedMap = new Map<number, number>();
    for (const item of budgets) {
      dedupedMap.set(item.categoryId, item.allocatedAmount);
    }

    const categoryIds = [...dedupedMap.keys()];
    const ownedCategories = await txUow.categories.findManyByIdsAndUserId(categoryIds, userId);

    if (ownedCategories.length !== categoryIds.length) {
      throw new ValidationError("One or more selected categories do not belong to your account.");
    }

    const nonExpense = ownedCategories.find((c) => c.type !== "EXPENSE");
    if (nonExpense) {
      throw new ValidationError(
        `Category "${nonExpense.name}" is an income category. Budgets can only be allocated to expense categories.`
      );
    }

    return [...dedupedMap.entries()].map(([categoryId, allocatedAmount]) => ({
      categoryId,
      allocatedAmount,
    }));
  }

  async listPlans(userId: number): Promise<MonthlyPlanDTO[]> {
    const plans = await this.uow.monthlyPlans.findAllByUserId(userId);
    return plans.map((p) => MonthlyPlanDTO.fromEntity(p));
  }

  async getCurrentPlan(userId: number, rawQuery: unknown): Promise<MonthlyPlanDTO | null> {
    const query = parseDTO(currentPlanQuerySchema, rawQuery || {});
    const now = new Date();
    const month = query.month ?? now.getMonth() + 1;
    const year = query.year ?? now.getFullYear();

    const plan = await this.uow.monthlyPlans.findByPeriodAndUserId(month, year, userId);
    return plan ? MonthlyPlanDTO.fromEntity(plan) : null;
  }

  async getPlanById(userId: number, planId: number): Promise<MonthlyPlanDTO> {
    const plan = await this.uow.monthlyPlans.findByIdAndUserId(planId, userId);
    if (!plan) {
      throw new NotFoundError("Monthly plan not found.");
    }
    return MonthlyPlanDTO.fromEntity(plan);
  }

  async getPlanSummary(userId: number, planId: number): Promise<PlanSummaryResult> {
    const planDto = await this.getPlanById(userId, planId);
    return planDto.summary;
  }

  async createPlan(userId: number, rawData: unknown): Promise<MonthlyPlanDTO> {
    const input = parseDTO(createPlanSchema, rawData);

    const existing = await this.uow.monthlyPlans.findByPeriodAndUserId(
      input.month,
      input.year,
      userId
    );
    if (existing) {
      throw new ConflictError(
        `A monthly plan already exists for ${input.month}/${input.year}. Please load and edit it instead.`
      );
    }

    const savedPlan = await this.uow.runInTransaction(async (txUow) => {
      const normalizedBudgets = await this.validateExpenseBudgetCategories(
        txUow,
        userId,
        input.budgets
      );

      const created = await txUow.monthlyPlans.create({
        userId,
        month: input.month,
        year: input.year,
        plannedIncome: input.plannedIncome,
        savingsGoal: input.savingsGoal,
        status: input.status as PlanStatus,
      });

      for (const b of normalizedBudgets) {
        await txUow.categoryBudgets.upsert(created.id!, b.categoryId, b.allocatedAmount);
      }

      const fullPlan = await txUow.monthlyPlans.findByIdAndUserId(created.id!, userId);
      if (!fullPlan) {
        throw new NotFoundError("Monthly plan not found after creation.");
      }
      return fullPlan;
    });

    return MonthlyPlanDTO.fromEntity(savedPlan);
  }

  async updatePlan(userId: number, planId: number, rawData: unknown): Promise<MonthlyPlanDTO> {
    const input = parseDTO(updatePlanSchema, rawData);

    const updatedPlan = await this.uow.runInTransaction(async (txUow) => {
      const existing = await txUow.monthlyPlans.findByIdAndUserId(planId, userId);
      if (!existing) {
        throw new NotFoundError("Monthly plan not found.");
      }

      if (input.budgets !== undefined) {
        const normalizedBudgets = await this.validateExpenseBudgetCategories(
          txUow,
          userId,
          input.budgets
        );
        for (const b of normalizedBudgets) {
          await txUow.categoryBudgets.upsert(planId, b.categoryId, b.allocatedAmount);
        }
      }

      if (
        input.plannedIncome !== undefined ||
        input.savingsGoal !== undefined ||
        input.status !== undefined
      ) {
        await txUow.monthlyPlans.update(planId, {
          plannedIncome: input.plannedIncome,
          savingsGoal: input.savingsGoal,
          status: input.status as PlanStatus | undefined,
        });
      }

      const fullPlan = await txUow.monthlyPlans.findByIdAndUserId(planId, userId);
      if (!fullPlan) {
        throw new NotFoundError("Monthly plan not found.");
      }
      return fullPlan;
    });

    return MonthlyPlanDTO.fromEntity(updatedPlan);
  }

  async updatePlanStatus(
    userId: number,
    planId: number,
    rawData: unknown
  ): Promise<MonthlyPlanDTO> {
    const input = parseDTO(updatePlanStatusSchema, rawData);

    const existing = await this.uow.monthlyPlans.findByIdAndUserId(planId, userId);
    if (!existing) {
      throw new NotFoundError("Monthly plan not found.");
    }

    const updated = await this.uow.monthlyPlans.updateStatus(planId, input.status as PlanStatus);
    return MonthlyPlanDTO.fromEntity(updated);
  }
}
