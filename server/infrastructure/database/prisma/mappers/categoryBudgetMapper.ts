import {
  Category as PrismaCategory,
  CategoryBudget as PrismaCategoryBudget,
} from "@prisma/client";
import { CategoryBudget } from "../../../../domain/entities/categoryBudget/index.js";
import { CategoryMapper } from "./categoryMapper.js";

export type PrismaCategoryBudgetWithCategory = PrismaCategoryBudget & {
  category?: PrismaCategory | null;
};

export class CategoryBudgetMapper {
  static toEntity(raw: PrismaCategoryBudgetWithCategory): CategoryBudget {
    return new CategoryBudget({
      id: raw.id,
      monthlyPlanId: raw.monthlyPlanId,
      categoryId: raw.categoryId,
      allocatedAmount: Number(raw.allocatedAmount),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      category: raw.category ? CategoryMapper.toEntity(raw.category) : null,
    });
  }
}
