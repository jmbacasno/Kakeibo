import { Prisma, PrismaClient } from "@prisma/client";
import { MonthlyPlanEntity } from "../../../../domain/entities/monthlyPlan/index.js";
import {
  AvailablePlanPeriod,
  MonthlyPlanRepositoryInterface,
} from "../../../../domain/repositories/monthlyPlanRepositoryInterface.js";
import { prisma } from "../client.js";
import { MonthlyPlanMapper } from "../mappers/monthlyPlanMapper.js";

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
    return rows.map(MonthlyPlanMapper.toEntity);
  }

  async findAvailablePeriodsByUserId(userId: number): Promise<AvailablePlanPeriod[]> {
    return this.client.monthlyPlan.findMany({
      where: { userId },
      select: {
        id: true,
        month: true,
        year: true,
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });
  }

  async findByIdAndUserId(id: number, userId: number): Promise<MonthlyPlanEntity | null> {
    const row = await this.client.monthlyPlan.findFirst({
      where: { id, userId },
      include: planFullInclude,
    });
    return row ? MonthlyPlanMapper.toEntity(row) : null;
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
    return row ? MonthlyPlanMapper.toEntity(row) : null;
  }

  async create(data: {
    userId: number;
    month: number;
    year: number;
    plannedIncome: number;
    savingsGoal: number;
  }): Promise<MonthlyPlanEntity> {
    const created = await this.client.monthlyPlan.create({
      data: {
        userId: data.userId,
        month: data.month,
        year: data.year,
        plannedIncome: data.plannedIncome,
        savingsGoal: data.savingsGoal,
      },
      include: planFullInclude,
    });
    return MonthlyPlanMapper.toEntity(created);
  }

  async update(
    id: number,
    data: {
      plannedIncome?: number;
      savingsGoal?: number;
    }
  ): Promise<MonthlyPlanEntity> {
    const updated = await this.client.monthlyPlan.update({
      where: { id },
      data: {
        ...(data.plannedIncome !== undefined ? { plannedIncome: data.plannedIncome } : {}),
        ...(data.savingsGoal !== undefined ? { savingsGoal: data.savingsGoal } : {}),
      },
      include: planFullInclude,
    });
    return MonthlyPlanMapper.toEntity(updated);
  }
}
