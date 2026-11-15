import { Prisma, PrismaClient } from "@prisma/client";
import { MonthlyReflectionEntity } from "../../../../domain/entities/monthlyReflection/index.js";
import {
  MonthlyReflectionRepositoryInterface,
  ReflectionFilterParams,
} from "../../../../domain/repositories/monthlyReflectionRepositoryInterface.js";
import { prisma } from "../client.js";
import { MonthlyReflectionMapper } from "../mappers/monthlyReflectionMapper.js";

type DbClient = PrismaClient | Prisma.TransactionClient;

const reflectionInclude = {
  monthlyPlan: {
    select: {
      id: true,
      month: true,
      year: true,
      status: true,
    },
  },
} as const;

export class MonthlyReflectionRepository implements MonthlyReflectionRepositoryInterface {
  constructor(private readonly client: DbClient = prisma) {}

  async findManyByUserId(
    userId: number,
    filters: ReflectionFilterParams
  ): Promise<MonthlyReflectionEntity[]> {
    const planFilter: Prisma.MonthlyPlanWhereInput = { userId };
    if (filters.month !== undefined) planFilter.month = filters.month;
    if (filters.year !== undefined) planFilter.year = filters.year;

    const where: Prisma.MonthlyReflectionWhereInput = {
      monthlyPlan: planFilter,
    };
    if (filters.planId) {
      where.monthlyPlanId = filters.planId;
    }

    const rows = await this.client.monthlyReflection.findMany({
      where,
      include: reflectionInclude,
      orderBy: [{ monthlyPlan: { year: "desc" } }, { monthlyPlan: { month: "desc" } }],
    });
    return rows.map(MonthlyReflectionMapper.toEntity);
  }

  async findByIdAndUserId(
    id: number,
    userId: number
  ): Promise<MonthlyReflectionEntity | null> {
    const row = await this.client.monthlyReflection.findFirst({
      where: {
        id,
        monthlyPlan: { userId },
      },
      include: reflectionInclude,
    });
    return row ? MonthlyReflectionMapper.toEntity(row) : null;
  }

  async findByPlanId(monthlyPlanId: number): Promise<MonthlyReflectionEntity | null> {
    const row = await this.client.monthlyReflection.findUnique({
      where: { monthlyPlanId },
      include: reflectionInclude,
    });
    return row ? MonthlyReflectionMapper.toEntity(row) : null;
  }

  async create(data: {
    monthlyPlanId: number;
    content: string;
  }): Promise<MonthlyReflectionEntity> {
    const created = await this.client.monthlyReflection.create({
      data,
      include: reflectionInclude,
    });
    return MonthlyReflectionMapper.toEntity(created);
  }

  async update(id: number, content: string): Promise<MonthlyReflectionEntity> {
    const updated = await this.client.monthlyReflection.update({
      where: { id },
      data: { content },
      include: reflectionInclude,
    });
    return MonthlyReflectionMapper.toEntity(updated);
  }

  async delete(id: number): Promise<void> {
    await this.client.monthlyReflection.delete({ where: { id } });
  }
}
