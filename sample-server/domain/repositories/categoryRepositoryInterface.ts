import { CategoryEntity } from "../entities/category/index.js";

export interface CategoryRepositoryInterface {
  findAllByUserId(userId: number): Promise<CategoryEntity[]>;
  findByIdAndUserId(id: number, userId: number): Promise<CategoryEntity | null>;
  create(category: CategoryEntity): Promise<CategoryEntity>;
  update(category: CategoryEntity): Promise<CategoryEntity>;
  delete(id: number): Promise<void>;
  reorder(userId: number, orderList: Array<{ id: number; customOrder: number }>): Promise<void>;
}
