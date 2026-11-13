import { Prisma, PrismaClient } from "@prisma/client";
import { TransactionEntity } from "../../domain/entities/transaction/index.js";
import {
  PaginatedTransactionsResult,
  TransactionFilterParams,
  TransactionRepositoryInterface,
} from "../../domain/repositories/transactionRepositoryInterface.js";
import { prisma } from "../persistence/clients/prisma.js";
import { TransactionModel } from "../persistence/models/transactionModel.js";

type DbClient = PrismaClient | Prisma.TransactionClient;

const transactionInclude = {
  category: true,
  monthlyPlan: {
    select: {
      id: true,
      month: true,
      year: true,
    },
  },
} as const;

export class TransactionRepository implements TransactionRepositoryInterface {
  constructor(private readonly client: DbClient = prisma) {}

  async findManyByUserId(
    userId: number,
    filters: TransactionFilterParams
  ): Promise<PaginatedTransactionsResult> {
    const where: Prisma.TransactionWhereInput = {
      monthlyPlan: { userId },
    };

    if (filters.planId) {
      where.monthlyPlanId = filters.planId;
    }
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }
    if (filters.type) {
      where.category = { type: filters.type };
    }
    if (filters.startDate || filters.endDate) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (filters.startDate) {
        const start = new Date(filters.startDate);
        start.setUTCHours(0, 0, 0, 0);
        dateFilter.gte = start;
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setUTCHours(23, 59, 59, 999);
        dateFilter.lte = end;
      }
      where.transactionDate = dateFilter;
    }
    if (filters.search) {
      where.description = {
        contains: filters.search,
      };
    }

    const orderBy: Prisma.TransactionOrderByWithRelationInput[] =
      filters.sortBy === "amount"
        ? [{ amount: filters.sortOrder }, { transactionDate: "desc" }, { id: "desc" }]
        : [{ transactionDate: filters.sortOrder }, { createdAt: filters.sortOrder }, { id: "desc" }];

    const skip = (filters.page - 1) * filters.limit;

    const [rows, total] = await Promise.all([
      this.client.transaction.findMany({
        where,
        include: transactionInclude,
        orderBy,
        skip,
        take: filters.limit,
      }),
      this.client.transaction.count({ where }),
    ]);

    return {
      transactions: rows.map(TransactionModel.toEntity),
      total,
    };
  }

  async findByIdAndUserId(id: number, userId: number): Promise<TransactionEntity | null> {
    const row = await this.client.transaction.findFirst({
      where: {
        id,
        monthlyPlan: { userId },
      },
      include: transactionInclude,
    });
    return row ? TransactionModel.toEntity(row) : null;
  }

  async create(data: {
    monthlyPlanId: number;
    categoryId: number;
    amount: number;
    description: string;
    transactionDate: Date;
  }): Promise<TransactionEntity> {
    const created = await this.client.transaction.create({
      data: {
        monthlyPlanId: data.monthlyPlanId,
        categoryId: data.categoryId,
        amount: data.amount,
        description: data.description,
        transactionDate: data.transactionDate,
      },
      include: transactionInclude,
    });
    return TransactionModel.toEntity(created);
  }

  async update(
    id: number,
    data: {
      monthlyPlanId?: number;
      categoryId?: number;
      amount?: number;
      description?: string;
      transactionDate?: Date;
    }
  ): Promise<TransactionEntity> {
    const updated = await this.client.transaction.update({
      where: { id },
      data,
      include: transactionInclude,
    });
    return TransactionModel.toEntity(updated);
  }

  async delete(id: number): Promise<void> {
    await this.client.transaction.delete({ where: { id } });
  }
}
