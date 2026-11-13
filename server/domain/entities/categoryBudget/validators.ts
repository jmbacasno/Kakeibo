import { NegativeBudgetAmountError } from "./errors.js";

export function validateBudgetAmount(allocatedAmount: number): void {
  if (!Number.isFinite(allocatedAmount) || allocatedAmount < 0) {
    throw new NegativeBudgetAmountError();
  }
}
