import { MonthlyReflection } from "../../domain/entities/monthlyReflection/index.js";
import { UnitOfWorkInterface } from "../../domain/repositories/unitOfWorkInterface.js";
import { calculatePlanSummary } from "../../domain/services/financialCalculator.js";
import {
  createReflectionSchema,
  listReflectionsQuerySchema,
  MonthlyReflectionDTO,
  updateReflectionSchema,
} from "../dtos/monthlyReflectionDTO.js";
import { ConflictError, NotFoundError } from "../errors.js";
import { parseDTO } from "../validation.js";

export class MonthlyReflectionService {
  constructor(private readonly uow: UnitOfWorkInterface) {}

  private async getFinancialSummaryForPlan(userId: number, monthlyPlanId: number) {
    const plan = await this.uow.monthlyPlans.findByIdAndUserId(monthlyPlanId, userId);
    if (!plan) return null;
    return calculatePlanSummary(
      plan.plannedIncome,
      plan.savingsGoal,
      plan.budgets || [],
      plan.transactions || []
    );
  }

  async listReflections(userId: number, rawQuery: unknown): Promise<MonthlyReflectionDTO[]> {
    const query = parseDTO(listReflectionsQuerySchema, rawQuery || {});
    const reflections = await this.uow.monthlyReflections.findManyByUserId(userId, {
      planId: query.planId,
      month: query.month,
      year: query.year,
    });
    return reflections.map((r) => MonthlyReflectionDTO.fromEntity(r));
  }

  async getReflectionById(userId: number, reflectionId: number): Promise<MonthlyReflectionDTO> {
    const reflection = await this.uow.monthlyReflections.findByIdAndUserId(reflectionId, userId);
    if (!reflection) {
      throw new NotFoundError("Monthly reflection not found.");
    }
    const financialSummary = await this.getFinancialSummaryForPlan(
      userId,
      reflection.monthlyPlanId
    );
    return MonthlyReflectionDTO.fromEntity(reflection, financialSummary);
  }

  async createReflection(userId: number, rawData: unknown): Promise<MonthlyReflectionDTO> {
    const input = parseDTO(createReflectionSchema, rawData);

    const plan = await this.uow.monthlyPlans.findByIdAndUserId(input.monthlyPlanId, userId);
    if (!plan) {
      throw new NotFoundError("Monthly plan not found.");
    }

    const existing = await this.uow.monthlyReflections.findByPlanId(plan.id!);
    if (existing) {
      throw new ConflictError(
        "A reflection already exists for this monthly plan. Please edit the existing reflection instead."
      );
    }

    const entity = new MonthlyReflection({
      id: null,
      monthlyPlanId: plan.id!,
      content: input.content,
      createdAt: null,
      updatedAt: null,
    });

    const created = await this.uow.monthlyReflections.create({
      monthlyPlanId: entity.monthlyPlanId,
      content: entity.content,
    });

    const financialSummary = calculatePlanSummary(
      plan.plannedIncome,
      plan.savingsGoal,
      plan.budgets || [],
      plan.transactions || []
    );

    return MonthlyReflectionDTO.fromEntity(created, financialSummary);
  }

  async updateReflection(
    userId: number,
    reflectionId: number,
    rawData: unknown
  ): Promise<MonthlyReflectionDTO> {
    const input = parseDTO(updateReflectionSchema, rawData);

    const existing = await this.uow.monthlyReflections.findByIdAndUserId(reflectionId, userId);
    if (!existing) {
      throw new NotFoundError("Monthly reflection not found.");
    }

    const entity = new MonthlyReflection({
      ...existing,
      content: input.content,
    });

    const updated = await this.uow.monthlyReflections.update(reflectionId, entity.content);
    const financialSummary = await this.getFinancialSummaryForPlan(
      userId,
      updated.monthlyPlanId
    );
    return MonthlyReflectionDTO.fromEntity(updated, financialSummary);
  }

  async deleteReflection(userId: number, reflectionId: number): Promise<void> {
    const existing = await this.uow.monthlyReflections.findByIdAndUserId(reflectionId, userId);
    if (!existing) {
      throw new NotFoundError("Monthly reflection not found.");
    }
    await this.uow.monthlyReflections.delete(reflectionId);
  }
}
