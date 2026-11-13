import { UnitOfWorkInterface } from "../../domain/repositories/unitOfWorkInterface.js";
import { Category } from "../../domain/entities/category/index.js";
import { ApplicationError } from "../errors.js";
import { CategoryInputDTO, CategoryDTO, categoryInputSchema } from "../dtos/categoryDTO.js";
import { parseDTO } from "../validation.js";


export class CategoryService {
  constructor(private uow: UnitOfWorkInterface) {}

  async getCategories(userId: number): Promise<CategoryDTO[]> {
    const categories = await this.uow.categories.findAllByUserId(userId);
    return categories.map(cat => CategoryDTO.fromEntity(cat)!).filter(Boolean) as CategoryDTO[];
  }

  async createCategory(userId: number, rawInput: unknown): Promise<CategoryDTO> {
    const input = parseDTO(categoryInputSchema, rawInput);
    
    // Find highest order so that new categories are added at the end
    const existingCategories = await this.uow.categories.findAllByUserId(userId);
    const maxOrder = existingCategories.length > 0 
      ? Math.max(...existingCategories.map(c => c.customOrder)) 
      : -1;
    const newOrder = input.customOrder !== undefined ? input.customOrder : (maxOrder + 1);

    // Domain validation runs inside Category constructor
    const draft = new Category({
      name: input.name,
      color: input.color || "#8b5cf6",
      customOrder: newOrder,
      userId,
      createdAt: null,
      id: null,
      updatedAt: null,
    });

    const category = await this.uow.categories.create(draft);
    return CategoryDTO.fromEntity(category)!;
  }

  async updateCategory(userId: number, id: number, rawInput: unknown): Promise<CategoryDTO> {
    const input = parseDTO(categoryInputSchema, rawInput);
    const existing = await this.uow.categories.findByIdAndUserId(id, userId);
    if (!existing) {
      throw new ApplicationError("Category not found or access denied");
    }

    // Domain validation runs inside Category constructor
    const draft = new Category({
      name: input.name,
      color: input.color || existing.color,
      customOrder: input.customOrder !== undefined ? input.customOrder : existing.customOrder,
      userId,
      createdAt: existing.createdAt,
      id,
      updatedAt: existing.updatedAt,
    });

    const category = await this.uow.categories.update(draft);
    return CategoryDTO.fromEntity(category)!;
  }

  async deleteCategory(userId: number, id: number): Promise<void> {
    const existing = await this.uow.categories.findByIdAndUserId(id, userId);
    if (!existing) {
      throw new ApplicationError("Category not found or access denied");
    }
    await this.uow.categories.delete(id);
  }

  async reorderCategories(userId: number, orderList: Array<{ id: number; customOrder: number }>): Promise<void> {
    if (!Array.isArray(orderList)) {
      throw new ApplicationError("Order list must be an array");
    }
    await this.uow.categories.reorder(userId, orderList);
  }
}
