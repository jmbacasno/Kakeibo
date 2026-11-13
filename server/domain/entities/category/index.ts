import {
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
  type: CategoryType;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
  _count?: CategoryUsageCounts;
}

export class Category implements CategoryEntity {
  id: number | null;
  userId: number;
  name: string;
  type: CategoryType;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
  _count?: CategoryUsageCounts;

  constructor(data: CategoryEntity) {
    this.id = data.id;
    this.userId = data.userId;
    this.name = data.name.trim();
    this.type = data.type;
    this.isDefault = data.isDefault;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this._count = data._count;

    this.validate();
  }

  validate(): void {
    validateCategoryUserId(this.userId);
    validateCategoryName(this.name);
    validateCategoryType(this.type);
  }

  updateName(name: string): this {
    validateCategoryName(name);
    this.name = name.trim();
    this.updatedAt = new Date();
    return this;
  }

  setStatus(isActive: boolean): this {
    this.isActive = isActive;
    this.updatedAt = new Date();
    return this;
  }

  isInUse(): boolean {
    if (!this._count) return false;
    return this._count.transactions > 0 || this._count.categoryBudgets > 0;
  }
}
