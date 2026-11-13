import { DomainError } from "../../errors.js";

export class NegativeBudgetAmountError extends DomainError {
  constructor() {
    super("Allocated budget amount cannot be negative", "NEGATIVE_BUDGET_AMOUNT");
    this.name = "NegativeBudgetAmountError";
  }
}

export class NonExpenseBudgetCategoryError extends DomainError {
  constructor(categoryName: string) {
    super(
      `Category "${categoryName}" is an income category. Only expense categories can have budgets.`,
      "NON_EXPENSE_BUDGET_CATEGORY"
    );
    this.name = "NonExpenseBudgetCategoryError";
  }
}
