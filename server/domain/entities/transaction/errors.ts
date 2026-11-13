import { DomainError } from "../../errors.js";

export class InvalidTransactionAmountError extends DomainError {
  constructor() {
    super("Transaction amount must be greater than zero", "INVALID_TRANSACTION_AMOUNT");
    this.name = "InvalidTransactionAmountError";
  }
}

export class EmptyTransactionDescriptionError extends DomainError {
  constructor() {
    super("Transaction description cannot be empty", "EMPTY_TRANSACTION_DESCRIPTION");
    this.name = "EmptyTransactionDescriptionError";
  }
}

export class TransactionDateOutOfMonthError extends DomainError {
  constructor(month: number, year: number) {
    super(
      `Transaction date must fall within the selected plan month (${month}/${year}).`,
      "TRANSACTION_DATE_OUT_OF_MONTH"
    );
    this.name = "TransactionDateOutOfMonthError";
  }
}
