import { CategoryRepositoryInterface } from "../../domain/repositories/categoryRepositoryInterface.js";
import { CategoryEntity } from "../../domain/entities/category/index.js";
import { prisma } from "../persistence/clients/prisma.js";
import { CategoryModel } from "../persistence/models/categoryModel.js";

export class CategoryRepository implements CategoryRepositoryInterface {
  constructor(private client = prisma) {}

  async findAllByUserId(userId: number): Promise<CategoryEntity[]> {
    const categories = await this.client.category.findMany({
      where: { userId },
      orderBy: { customOrder: "asc" }
    });
    return categories.map(CategoryModel.toEntity);
  }

  async findByIdAndUserId(id: number, userId: number): Promise<CategoryEntity | null> {
    const category = await this.client.category.findFirst({ where: { id, userId } });
    if (!category) return null;
    return CategoryModel.toEntity(category);
  }

  async create(category: CategoryEntity): Promise<CategoryEntity> {
    const created = await this.client.category.create({
      data: {
        name: category.name,
        color: category.color,
        userId: category.userId,
        customOrder: category.customOrder || 0
      }
    });
    return CategoryModel.toEntity(created);
  }

  async update(category: CategoryEntity): Promise<CategoryEntity> {
    const updated = await this.client.category.update({
      where: { id: category.id! },
      data: {
        name: category.name,
        color: category.color,
        customOrder: category.customOrder
      }
    });
    return CategoryModel.toEntity(updated);
  }

  async delete(id: number): Promise<void> {
    await this.client.category.delete({ where: { id } });
  }

  async reorder(userId: number, orderList: Array<{ id: number; customOrder: number }>): Promise<void> {
    await this.client.$transaction(
      orderList.map((item) =>
        this.client.category.update({
          where: { id: item.id, userId },
          data: { customOrder: item.customOrder }
        })
      )
    );
  }
}
