import { CategoryEntity, CategoryType } from "../entities/category/index.js";

export interface CategoryFilterParams {
  type?: CategoryType;
}

export interface CategoryRepositoryInterface {
  findAllByUserId(userId: number, filters?: CategoryFilterParams): Promise<CategoryEntity[]>;
  findByIdAndUserId(id: number, userId: number): Promise<CategoryEntity | null>;
  findManyByIdsAndUserId(ids: number[], userId: number): Promise<CategoryEntity[]>;
  findByNameTypeAndUserId(
    name: string,
    type: CategoryType,
    userId: number,
    excludeId?: number
  ): Promise<CategoryEntity | null>;
  create(category: CategoryEntity): Promise<CategoryEntity>;
  upsertDefault(category: CategoryEntity): Promise<CategoryEntity>;
  update(id: number, data: { name: string; description: string | null }): Promise<CategoryEntity>;
  delete(id: number): Promise<void>;
}
