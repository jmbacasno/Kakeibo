import { Category as PrismaCategory } from "@prisma/client";
import {
  Category,
  CategoryType,
  CategoryUsageCounts,
} from "../../../../domain/entities/category/index.js";

export type PrismaCategoryWithCounts = PrismaCategory & {
  _count?: CategoryUsageCounts;
};

export class CategoryMapper {
  static toEntity(raw: PrismaCategoryWithCounts): Category {
    return new Category({
      id: raw.id,
      userId: raw.userId,
      name: raw.name,
      description: raw.description ?? null,
      type: raw.type as CategoryType,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      _count: raw._count,
    });
  }
}
