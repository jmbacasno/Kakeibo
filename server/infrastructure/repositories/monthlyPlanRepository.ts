import { Prisma, PrismaClient } from "@prisma/client";
import { MonthlyPlanEntity, PlanStatus } from "../../domain/entities/monthlyPlan/index.js";
import {
  AvailablePlanPeriod,
  MonthlyPlanRepositoryInterface,
} from "../../domain/repositories/monthlyPlanRepositoryInterface.js";
import { prisma } from "../persistence/clients/prisma.js";
import { MonthlyPlanModel } from "../persistence/models/monthlyPlanModel.js";

type DbClient = PrismaClient | Prisma.TransactionClient;

const planFullInclude = {
  budgets: {
    include: {
      category: true,
    },
    orderBy: {
      id: "asc" as const,
    },
  },
  transactions: {
    include: {
      category: true,
    },
  },
} as const;

export class MonthlyPlanRepository implements MonthlyPlanRepositoryInterface {
  constructor(private readonly client: DbClient = prisma) {}

  async findAllByUserId(userId: number): Promise<MonthlyPlanEntity[]> {
    const rows = await this.client.monthlyPlan.findMany({
      where: { userId },
      include: planFullInclude,
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });
    return rows.map(MonthlyPlanModel.toEntity);
  }

  async findAvailablePeriodsByUserId(userId: number): Promise<AvailablePlanPeriod[]> {
    return this.client.monthlyPlan.findMany({
      where: { userId },
      select: {
        id: true,
        month: true,
        year: true,
        status: true,
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });
  }

  async findByIdAndUserId(id: number, userId: number): Promise<MonthlyPlanEntity | null> {
    const row = await this.client.monthlyPlan.findFirst({
      where: { id, userId },
      include: planFullInclude,
    });
    return row ? MonthlyPlanModel.toEntity(row) : null;
  }

  async findByPeriodAndUserId(
    month: number,
    year: number,
    userId: number
  ): Promise<MonthlyPlanEntity | null> {
    const row = await this.client.monthlyPlan.findFirst({
      where: { month, year, userId },
      include: planFullInclude,
    });
    return row ? MonthlyPlanModel.toEntity(row) : null;
  }

  async create(data: {
    userId: number;
    month: number;
    year: number;
    plannedIncome: number;
    savingsGoal: number;
    status: PlanStatus;
  }): Promise<MonthlyPlanEntity> {
    const created = await this.client.monthlyPlan.create({
      data: {
        userId: data.userId,
        month: data.month,
        year: data.year,
        plannedIncome: data.plannedIncome,
        savingsGoal: data.savingsGoal,
        status: data.status,
      },
      include: planFullInclude,
    });
    return MonthlyPlanModel.toEntity(created);
  }

  async update(
    id: number,
    data: {
      plannedIncome?: number;
      savingsGoal?: number;
      status?: PlanStatus;
    }
  ): Promise<MonthlyPlanEntity> {
    const updated = await this.client.monthlyPlan.update({
      where: { id },
      data: {
        ...(data.plannedIncome !== undefined ? { plannedIncome: data.plannedIncome } : {}),
        ...(data.savingsGoal !== undefined ? { savingsGoal: data.savingsGoal } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
      },
      include: planFullInclude,
    });
    return MonthlyPlanModel.toEntity(updated);
  }

  async updateStatus(id: number, status: PlanStatus): Promise<MonthlyPlanEntity> {
    const updated = await this.client.monthlyPlan.update({
      where: { id },
      data: { status },
      include: planFullInclude,
    });
    return MonthlyPlanModel.toEntity(updated);
  }
}
