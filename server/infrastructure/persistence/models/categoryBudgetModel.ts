import {
  Category as PrismaCategory,
  CategoryBudget as PrismaCategoryBudget,
} from "@prisma/client";
import { CategoryBudget } from "../../../domain/entities/categoryBudget/index.js";
import { CategoryModel } from "./categoryModel.js";

export type PrismaCategoryBudgetWithCategory = PrismaCategoryBudget & {
  category?: PrismaCategory | null;
};

export class CategoryBudgetModel {
  static toEntity(raw: PrismaCategoryBudgetWithCategory): CategoryBudget {
    return new CategoryBudget({
      id: raw.id,
      monthlyPlanId: raw.monthlyPlanId,
      categoryId: raw.categoryId,
      allocatedAmount: Number(raw.allocatedAmount),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      category: raw.category ? CategoryModel.toEntity(raw.category) : null,
    });
  }
}
