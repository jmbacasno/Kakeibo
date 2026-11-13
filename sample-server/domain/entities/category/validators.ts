import {
  EmptyCategoryNameError,
  CategoryNameTooLongError,
  InvalidCategoryColorError,
  InvalidCategoryUserIdError,
} from "./errors.js";

// --- Name Validation Functions ---

export function isCategoryNameNotEmpty(name: string): void {
  if (!name || name.trim() === "") {
    throw new EmptyCategoryNameError();
  }
}

export function isCategoryNameWithinLimit(name: string): void {
  if (name.length > 50) {
    throw new CategoryNameTooLongError();
  }
}

export function validateName(name: string): void {
  isCategoryNameNotEmpty(name);
  isCategoryNameWithinLimit(name);
}

// --- Color Validation Functions ---

export function isCategoryColorFormatValid(color: string): void {
  const validColors = [
    "blue", "orange", "red", "green", "yellow", "purple", "indigo", "brown", "pink", "teal",
    "emerald", "amber", "cyan"
  ];
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  const nameRegex = /^[a-zA-Z]+$/;
  if (!hexRegex.test(color) && !validColors.includes(color.toLowerCase()) && !nameRegex.test(color)) {
    throw new InvalidCategoryColorError();
  }
}

export function validateColor(color: string): void {
  isCategoryColorFormatValid(color);
}

// --- User ID Validation Functions ---

export function isCategoryUserIdValid(userId: number): void {
  if (userId < 0) {
    throw new InvalidCategoryUserIdError();
  }
}

export function validateUserId(userId: number): void {
  isCategoryUserIdValid(userId);
}
