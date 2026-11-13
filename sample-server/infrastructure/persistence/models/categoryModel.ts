import { Category as PrismaCategory } from "@prisma/client";
import { Category } from "../../../domain/entities/category/index.js";

export class CategoryModel {
  static toEntity(raw: PrismaCategory): Category {
    return new Category({
      id: raw.id,
      name: raw.name,
      color: raw.color,
      customOrder: raw.customOrder,
      userId: raw.userId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
