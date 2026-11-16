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

export class CategoryDescriptionTooLongError extends DomainError {
  constructor() {
    super("Category description cannot exceed 255 characters", "CATEGORY_DESCRIPTION_TOO_LONG");
    this.name = "CategoryDescriptionTooLongError";
  }
}

export class InvalidCategoryTypeError extends DomainError {
  constructor() {
    super("Category type must be INCOME or EXPENSE", "INVALID_CATEGORY_TYPE");
    this.name = "InvalidCategoryTypeError";
  }
}

export class InvalidCategoryUserIdError extends DomainError {
  constructor() {
    super("User ID must be valid", "INVALID_CATEGORY_USER_ID");
    this.name = "InvalidCategoryUserIdError";
  }
}
