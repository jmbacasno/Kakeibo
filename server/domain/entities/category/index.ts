import {
  validateCategoryDescription,
  validateCategoryName,
  validateCategoryType,
  validateCategoryUserId,
} from "./validators.js";

export type CategoryType = "INCOME" | "EXPENSE";

export interface CategoryUsageCounts {
  transactions: number;
  categoryBudgets: number;
}

export interface CategoryEntity {
  id: number | null;
  userId: number;
  name: string;
  description: string | null;
  type: CategoryType;
  createdAt: Date | null;
  updatedAt: Date | null;
  _count?: CategoryUsageCounts;
}

export class Category implements CategoryEntity {
  id: number | null;
  userId: number;
  name: string;
  description: string | null;
  type: CategoryType;
  createdAt: Date | null;
  updatedAt: Date | null;
  _count?: CategoryUsageCounts;

  constructor(data: CategoryEntity) {
    this.id = data.id;
    this.userId = data.userId;
    this.name = data.name.trim();
    this.description =
      data.description && data.description.trim().length > 0 ? data.description.trim() : null;
    this.type = data.type;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this._count = data._count;

    this.validate();
  }

  validate(): void {
    validateCategoryUserId(this.userId);
    validateCategoryName(this.name);
    validateCategoryDescription(this.description);
    validateCategoryType(this.type);
  }

  updateDetails(name: string, description: string | null): this {
    const normalizedDesc =
      description && description.trim().length > 0 ? description.trim() : null;
    validateCategoryName(name);
    validateCategoryDescription(normalizedDesc);
    this.name = name.trim();
    this.description = normalizedDesc;
    this.updatedAt = new Date();
    return this;
  }

  isInUse(): boolean {
    if (!this._count) return false;
    return this._count.transactions > 0 || this._count.categoryBudgets > 0;
  }
}
