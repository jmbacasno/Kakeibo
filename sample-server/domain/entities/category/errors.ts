import { DomainError } from "../../errors.js";

export class EmptyCategoryNameError extends DomainError {
  constructor() {
    super("Category name cannot be empty", "EMPTY_CATEGORY_NAME");
    this.name = "EmptyCategoryNameError";
  }
}

export class CategoryNameTooLongError extends DomainError {
  constructor() {
    super("Category name cannot exceed 50 characters", "CATEGORY_NAME_TOO_LONG");
    this.name = "CategoryNameTooLongError";
  }
}

export class InvalidCategoryColorError extends DomainError {
  constructor() {
    super("Category color must be a valid hex color code or color name", "INVALID_CATEGORY_COLOR");
    this.name = "InvalidCategoryColorError";
  }
}

export class InvalidCategoryUserIdError extends DomainError {
  constructor() {
    super("User ID must be valid", "INVALID_CATEGORY_USER_ID");
    this.name = "InvalidCategoryUserIdError";
  }
}
