import { Prisma, PrismaClient } from "@prisma/client";
import { CategoryBudgetEntity } from "../../../../domain/entities/categoryBudget/index.js";
import { CategoryBudgetRepositoryInterface } from "../../../../domain/repositories/categoryBudgetRepositoryInterface.js";
import { prisma } from "../client.js";
import { CategoryBudgetMapper } from "../mappers/categoryBudgetMapper.js";

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
    return CategoryBudgetMapper.toEntity(saved);
  }

  async deleteMissingForPlan(monthlyPlanId: number, keepCategoryIds: number[]): Promise<void> {
    if (keepCategoryIds.length === 0) {
      await this.client.categoryBudget.deleteMany({
        where: { monthlyPlanId },
      });
      return;
    }

    await this.client.categoryBudget.deleteMany({
      where: {
        monthlyPlanId,
        categoryId: { notIn: keepCategoryIds },
      },
    });
  }
}
