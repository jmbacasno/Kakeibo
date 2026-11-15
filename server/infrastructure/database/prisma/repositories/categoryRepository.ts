import { Prisma, PrismaClient } from "@prisma/client";
import { CategoryEntity, CategoryType } from "../../../../domain/entities/category/index.js";
import {
  CategoryFilterParams,
  CategoryRepositoryInterface,
} from "../../../../domain/repositories/categoryRepositoryInterface.js";
import { prisma } from "../client.js";
import { CategoryMapper } from "../mappers/categoryMapper.js";

type DbClient = PrismaClient | Prisma.TransactionClient;

const categoryCountInclude = {
  _count: {
    select: {
      transactions: true,
      categoryBudgets: true,
    },
  },
} as const;

export class CategoryRepository implements CategoryRepositoryInterface {
  constructor(private readonly client: DbClient = prisma) {}

  async findAllByUserId(
    userId: number,
    filters?: CategoryFilterParams
  ): Promise<CategoryEntity[]> {
    const where: Prisma.CategoryWhereInput = { userId };
    if (filters?.type) where.type = filters.type;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    const rows = await this.client.category.findMany({
      where,
      include: categoryCountInclude,
      orderBy: [{ type: "asc" }, { isDefault: "desc" }, { name: "asc" }],
    });
    return rows.map(CategoryMapper.toEntity);
  }

  async findByIdAndUserId(id: number, userId: number): Promise<CategoryEntity | null> {
    const row = await this.client.category.findFirst({
      where: { id, userId },
      include: categoryCountInclude,
    });
    return row ? CategoryMapper.toEntity(row) : null;
  }

  async findManyByIdsAndUserId(ids: number[], userId: number): Promise<CategoryEntity[]> {
    if (ids.length === 0) return [];
    const rows = await this.client.category.findMany({
      where: {
        userId,
        id: { in: ids },
      },
      include: categoryCountInclude,
    });
    return rows.map(CategoryMapper.toEntity);
  }

  async findByNameTypeAndUserId(
    name: string,
    type: CategoryType,
    userId: number,
    excludeId?: number
  ): Promise<CategoryEntity | null> {
    const normalized = name.trim().toLowerCase();
    const candidates = await this.client.category.findMany({
      where: {
        userId,
        type,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      include: categoryCountInclude,
    });
    const match = candidates.find((c) => c.name.trim().toLowerCase() === normalized);
    return match ? CategoryMapper.toEntity(match) : null;
  }

  async create(category: CategoryEntity): Promise<CategoryEntity> {
    const created = await this.client.category.create({
      data: {
        userId: category.userId,
        name: category.name.trim(),
        type: category.type,
        isDefault: category.isDefault,
        isActive: category.isActive,
      },
      include: categoryCountInclude,
    });
    return CategoryMapper.toEntity(created);
  }

  async upsertDefault(category: CategoryEntity): Promise<CategoryEntity> {
    const saved = await this.client.category.upsert({
      where: {
        userId_name_type: {
          userId: category.userId,
          name: category.name.trim(),
          type: category.type,
        },
      },
      update: {},
      create: {
        userId: category.userId,
        name: category.name.trim(),
        type: category.type,
        isDefault: true,
        isActive: true,
      },
      include: categoryCountInclude,
    });
    return CategoryMapper.toEntity(saved);
  }

  async updateName(id: number, name: string): Promise<CategoryEntity> {
    const updated = await this.client.category.update({
      where: { id },
      data: { name: name.trim() },
      include: categoryCountInclude,
    });
    return CategoryMapper.toEntity(updated);
  }

  async updateStatus(id: number, isActive: boolean): Promise<CategoryEntity> {
    const updated = await this.client.category.update({
      where: { id },
      data: { isActive },
      include: categoryCountInclude,
    });
    return CategoryMapper.toEntity(updated);
  }

  async delete(id: number): Promise<void> {
    await this.client.category.delete({ where: { id } });
  }
}
