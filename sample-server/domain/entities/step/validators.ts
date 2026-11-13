import {
  EmptyStepTitleError,
  StepTitleTooLongError,
  InvalidStepCustomOrderError,
  InvalidStepTaskIdError,
} from "./errors.js";

// --- Title Validation Functions ---

export function isStepTitleNotEmpty(title: string): void {
  if (!title || title.trim() === "") {
    throw new EmptyStepTitleError();
  }
}

export function isStepTitleWithinLimit(title: string): void {
  if (title.length > 200) {
    throw new StepTitleTooLongError();
  }
}

export function validateTitle(title: string): void {
  isStepTitleNotEmpty(title);
  isStepTitleWithinLimit(title);
}

// --- Custom Order Validation Functions ---

export function isStepCustomOrderValid(customOrder: number): void {
  if (typeof customOrder !== "number" || isNaN(customOrder)) {
    throw new InvalidStepCustomOrderError();
  }
}

export function validateCustomOrder(customOrder: number): void {
  isStepCustomOrderValid(customOrder);
}

// --- Task ID Validation Functions ---

export function isStepTaskIdValid(taskId: number): void {
  if (taskId < 0) {
    throw new InvalidStepTaskIdError();
  }
}

export function validateTaskId(taskId: number): void {
  isStepTaskIdValid(taskId);
}
