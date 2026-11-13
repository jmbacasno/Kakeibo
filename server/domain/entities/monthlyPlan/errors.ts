import { DomainError } from "../../errors.js";

export class InvalidPlanMonthError extends DomainError {
  constructor() {
    super("Plan month must be between 1 and 12", "INVALID_PLAN_MONTH");
    this.name = "InvalidPlanMonthError";
  }
}

export class InvalidPlanYearError extends DomainError {
  constructor() {
    super("Plan year must be between 2000 and 2100", "INVALID_PLAN_YEAR");
    this.name = "InvalidPlanYearError";
  }
}

export class NegativePlanAmountError extends DomainError {
  constructor(field: string) {
    super(`${field} cannot be negative`, "NEGATIVE_PLAN_AMOUNT");
    this.name = "NegativePlanAmountError";
  }
}

export class InvalidPlanStatusError extends DomainError {
  constructor() {
    super("Plan status must be DRAFT, ACTIVE, or COMPLETED", "INVALID_PLAN_STATUS");
    this.name = "InvalidPlanStatusError";
  }
}
