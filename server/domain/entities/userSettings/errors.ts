import { DomainError } from "../../errors.js";

export class InvalidCurrencyError extends DomainError {
  constructor() {
    super("Unsupported currency selection.", "INVALID_CURRENCY");
    this.name = "InvalidCurrencyError";
  }
}

export class InvalidLanguageError extends DomainError {
  constructor() {
    super("Unsupported language selection.", "INVALID_LANGUAGE");
    this.name = "InvalidLanguageError";
  }
}

export class InvalidThemeError extends DomainError {
  constructor() {
    super("Theme must be one of: paper, light, dark.", "INVALID_THEME");
    this.name = "InvalidThemeError";
  }
}

export class InvalidDateFormatError extends DomainError {
  constructor() {
    super("Unsupported date format selection.", "INVALID_DATE_FORMAT");
    this.name = "InvalidDateFormatError";
  }
}

export class InvalidFirstDayOfWeekError extends DomainError {
  constructor() {
    super("First day of week must be 0 (Sunday) or 1 (Monday).", "INVALID_FIRST_DAY_OF_WEEK");
    this.name = "InvalidFirstDayOfWeekError";
  }
}
