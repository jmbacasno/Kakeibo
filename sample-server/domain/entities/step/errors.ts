import { DomainError } from "../../errors.js";

export class EmptyStepTitleError extends DomainError {
  constructor() {
    super("Step title cannot be empty", "EMPTY_STEP_TITLE");
    this.name = "EmptyStepTitleError";
  }
}

export class StepTitleTooLongError extends DomainError {
  constructor() {
    super("Step title cannot exceed 200 characters", "STEP_TITLE_TOO_LONG");
    this.name = "StepTitleTooLongError";
  }
}

export class InvalidStepCustomOrderError extends DomainError {
  constructor() {
    super("Step custom order must be a valid number", "INVALID_STEP_CUSTOM_ORDER");
    this.name = "InvalidStepCustomOrderError";
  }
}

export class InvalidStepTaskIdError extends DomainError {
  constructor() {
    super("Step must belong to a valid task ID", "INVALID_STEP_TASK_ID");
    this.name = "InvalidStepTaskIdError";
  }
}
