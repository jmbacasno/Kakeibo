import {
  CategoryDescriptionTooLongError,
  CategoryNameTooLongError,
  EmptyCategoryNameError,
  InvalidCategoryTypeError,
  InvalidCategoryUserIdError,
} from "./errors.js";

export function validateCategoryName(name: string): void {
  if (!name || name.trim() === "") {
    throw new EmptyCategoryNameError();
  }
  if (name.trim().length > 50) {
    throw new CategoryNameTooLongError();
  }
}

export function validateCategoryDescription(description: string | null): void {
  if (description !== null && description.trim().length > 255) {
    throw new CategoryDescriptionTooLongError();
  }
}

export function validateCategoryType(type: string): void {
  if (type !== "INCOME" && type !== "EXPENSE") {
    throw new InvalidCategoryTypeError();
  }
}

export function validateCategoryUserId(userId: number): void {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new InvalidCategoryUserIdError();
  }
}
