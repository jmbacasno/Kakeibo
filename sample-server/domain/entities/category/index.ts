import { validateName, validateColor, validateUserId } from "./validators.js";

export interface CategoryEntity {
  // --- Fields ---

  /** The human-readable label/title for the category */
  name: string;

  /** The CSS or Tailwind-compatible color name/hex code representing this category visually */
  color: string;

  /** The user ID that owns this category instance */
  userId: number;

  /** An optional floating sequence order number for custom drag-drop list sorting */
  customOrder?: number;

  /** Unique database ID assigned upon save, null for unsaved models */
  id: number | null;

  /** The point in time this category record was stored in the database */
  createdAt: Date | null;

  /** The point in time this category record was last updated */
  updatedAt: Date | null;
}

export class Category implements CategoryEntity {
  // --- Identity & Primitive Fields ---

  /** The human-readable label/title for the category */
  name: string;

  /** The CSS or Tailwind-compatible color name/hex code representing this category visually */
  color: string;

  /** The user ID that owns this category instance */
  userId: number;

  /** A floating sequence order number for custom drag-drop list sorting */
  customOrder: number;

  /** Unique database ID assigned upon save, null for unsaved models */
  id: number | null;

  /** The point in time this category record was stored in the database */
  createdAt: Date | null;

  /** The point in time this category record was last updated */
  updatedAt: Date | null;

  constructor(data: CategoryEntity) {
    this.name = data.name;
    this.color = data.color;
    this.userId = data.userId;
    this.customOrder = data.customOrder || 0;
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;

    this.validate();
  }

  static validateName(name: string): void {
    validateName(name);
  }

  static validateColor(color: string): void {
    validateColor(color);
  }

  static validateUserId(userId: number): void {
    validateUserId(userId);
  }

  validateName(name: string): void {
    validateName(name);
  }

  validateColor(color: string): void {
    validateColor(color);
  }

  validateUserId(userId: number): void {
    validateUserId(userId);
  }

  validate(): void {
    validateUserId(this.userId);
    validateName(this.name);
    validateColor(this.color);
  }

  update(data: Partial<Omit<CategoryEntity, "id" | "createdAt" | "updatedAt">>): this {
    if (data.name !== undefined) {
      validateName(data.name);
      this.name = data.name;
    }
    if (data.color !== undefined) {
      validateColor(data.color);
      this.color = data.color;
    }
    if (data.userId !== undefined) {
      validateUserId(data.userId);
      this.userId = data.userId;
    }
    if (data.customOrder !== undefined) {
      this.customOrder = data.customOrder;
    }
    this.updatedAt = new Date();
    this.validate();
    return this;
  }
}
