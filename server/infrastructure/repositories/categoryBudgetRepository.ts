import { Prisma, PrismaClient } from "@prisma/client";
import { CategoryBudgetEntity } from "../../domain/entities/categoryBudget/index.js";
import { CategoryBudgetRepositoryInterface } from "../../domain/repositories/categoryBudgetRepositoryInterface.js";
import { prisma } from "../persistence/clients/prisma.js";
import { CategoryBudgetModel } from "../persistence/models/categoryBudgetModel.js";

type DbClient = PrismaClient | Prisma.TransactionClient;

export class CategoryBudgetRepository implements CategoryBudgetRepositoryInterface {
  constructor(private readonly client: DbClient = prisma) {}

  async upsert(
    monthlyPlanId: number,
    categoryId: number,
    allocatedAmount: number
  ): Promise<CategoryBudgetEntity> {
    const saved = await this.client.categoryBudget.upsert({
      where: {
        monthlyPlanId_categoryId: {
          monthlyPlanId,
          categoryId,
        },
      },
      update: {
        allocatedAmount,
      },
      create: {
        monthlyPlanId,
        categoryId,
        allocatedAmount,
      },
      include: {
        category: true,
      },
    });
    return CategoryBudgetModel.toEntity(saved);
  }
}
