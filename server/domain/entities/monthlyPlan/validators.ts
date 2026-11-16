import {
  InvalidPlanMonthError,
  InvalidPlanYearError,
  NegativePlanAmountError,
} from "./errors.js";

export function validatePlanMonth(month: number): void {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new InvalidPlanMonthError();
  }
}

export function validatePlanYear(year: number): void {
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new InvalidPlanYearError();
  }
}

export function validateNonNegativeAmount(amount: number, fieldName: string): void {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new NegativePlanAmountError(fieldName);
  }
}
