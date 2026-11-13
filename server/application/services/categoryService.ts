import { Category } from "../../domain/entities/category/index.js";
import { UnitOfWorkInterface } from "../../domain/repositories/unitOfWorkInterface.js";
import {
  CategoryDTO,
  createCategorySchema,
  listCategoriesQuerySchema,
  updateCategorySchema,
  updateCategoryStatusSchema,
} from "../dtos/categoryDTO.js";
import { ConflictError, NotFoundError } from "../errors.js";
import { parseDTO } from "../validation.js";

export class CategoryService {
  constructor(private readonly uow: UnitOfWorkInterface) {}

  async listCategories(userId: number, rawQuery: unknown): Promise<CategoryDTO[]> {
    const query = parseDTO(listCategoriesQuerySchema, rawQuery || {});
    const categories = await this.uow.categories.findAllByUserId(userId, {
      type: query.type,
      isActive: query.isActive,
    });
    return categories.map((c) => CategoryDTO.fromEntity(c));
  }

  async getCategoryById(userId: number, categoryId: number): Promise<CategoryDTO> {
    const category = await this.uow.categories.findByIdAndUserId(categoryId, userId);
    if (!category) {
      throw new NotFoundError("Category not found.");
    }
    return CategoryDTO.fromEntity(category);
  }

  async createCategory(userId: number, rawData: unknown): Promise<CategoryDTO> {
    const input = parseDTO(createCategorySchema, rawData);

    const duplicate = await this.uow.categories.findByNameTypeAndUserId(
      input.name,
      input.type,
      userId
    );
    if (duplicate) {
      throw new ConflictError(
        `A ${input.type.toLowerCase()} category named "${input.name}" already exists.`
      );
    }

    const now = new Date();
    const categoryEntity = new Category({
      id: null,
      userId,
      name: input.name,
      type: input.type,
      isDefault: false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    const created = await this.uow.categories.create(categoryEntity);
    return CategoryDTO.fromEntity(created);
  }

  async updateCategory(userId: number, categoryId: number, rawData: unknown): Promise<CategoryDTO> {
    const input = parseDTO(updateCategorySchema, rawData);

    const existing = await this.uow.categories.findByIdAndUserId(categoryId, userId);
    if (!existing) {
      throw new NotFoundError("Category not found.");
    }

    const duplicate = await this.uow.categories.findByNameTypeAndUserId(
      input.name,
      existing.type,
      userId,
      categoryId
    );
    if (duplicate) {
      throw new ConflictError(
        `A ${existing.type.toLowerCase()} category named "${input.name}" already exists.`
      );
    }

    const entity = new Category(existing);
    entity.updateName(input.name);

    const updated = await this.uow.categories.updateName(categoryId, entity.name);
    return CategoryDTO.fromEntity(updated);
  }

  async updateCategoryStatus(
    userId: number,
    categoryId: number,
    rawData: unknown
  ): Promise<CategoryDTO> {
    const input = parseDTO(updateCategoryStatusSchema, rawData);

    const existing = await this.uow.categories.findByIdAndUserId(categoryId, userId);
    if (!existing) {
      throw new NotFoundError("Category not found.");
    }

    const entity = new Category(existing);
    entity.setStatus(input.isActive);

    const updated = await this.uow.categories.updateStatus(categoryId, entity.isActive);
    return CategoryDTO.fromEntity(updated);
  }

  async deleteCategory(userId: number, categoryId: number): Promise<void> {
    const existing = await this.uow.categories.findByIdAndUserId(categoryId, userId);
    if (!existing) {
      throw new NotFoundError("Category not found.");
    }

    const entity = new Category(existing);
    if (entity.isInUse()) {
      throw new ConflictError(
        "This category is already used by transactions or budgets. Archive it instead to hide it from new entries."
      );
    }

    await this.uow.categories.delete(categoryId);
  }
}
