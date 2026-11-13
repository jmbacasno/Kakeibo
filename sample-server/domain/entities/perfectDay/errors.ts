import { DomainError } from "../../errors.js";

export class EmptyPerfectDayDateError extends DomainError {
  constructor() {
    super("Date cannot be empty", "EMPTY_PERFECT_DAY_DATE");
    this.name = "EmptyPerfectDayDateError";
  }
}

export class InvalidPerfectDayDateFormatError extends DomainError {
  constructor() {
    super("Date must be in YYYY-MM-DD format", "INVALID_PERFECT_DAY_DATE_FORMAT");
    this.name = "InvalidPerfectDayDateFormatError";
  }
}

export class InvalidPerfectDayUserIdError extends DomainError {
  constructor() {
    super("User ID must be valid", "INVALID_PERFECT_DAY_USER_ID");
    this.name = "InvalidPerfectDayUserIdError";
  }
}
