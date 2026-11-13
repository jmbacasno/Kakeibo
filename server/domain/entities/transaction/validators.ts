import {
  EmptyTransactionDescriptionError,
  InvalidTransactionAmountError,
  TransactionDateOutOfMonthError,
} from "./errors.js";

export function validateTransactionAmount(amount: number): void {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new InvalidTransactionAmountError();
  }
}

export function validateTransactionDescription(description: string): void {
  if (!description || description.trim() === "" || description.trim().length > 200) {
    throw new EmptyTransactionDescriptionError();
  }
}

export function validateTransactionInPlanMonth(
  transactionDate: Date,
  planMonth: number,
  planYear: number
): void {
  const year = transactionDate.getUTCFullYear();
  const month = transactionDate.getUTCMonth() + 1;
  if (year !== planMonthYearParts(planMonth, planYear).year || month !== planMonth) {
    throw new TransactionDateOutOfMonthError(planMonth, planYear);
  }
}

function planMonthYearParts(month: number, year: number) {
  return { month, year };
}
