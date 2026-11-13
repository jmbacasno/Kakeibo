import { DomainError } from "../../errors.js";

export class EmptyEmailError extends DomainError {
  constructor() {
    super("User email cannot be empty", "EMPTY_EMAIL");
    this.name = "EmptyEmailError";
  }
}

export class InvalidEmailFormatError extends DomainError {
  constructor() {
    super("Invalid email format", "INVALID_EMAIL_FORMAT");
    this.name = "InvalidEmailFormatError";
  }
}

export class EmptyNameError extends DomainError {
  constructor() {
    super("Name cannot be empty when provided", "EMPTY_NAME");
    this.name = "EMPTY_NAME";
  }
}

export class InvalidPasswordLengthError extends DomainError {
  constructor() {
    super("Password must be at least 6 characters long", "INVALID_PASSWORD_LENGTH");
    this.name = "InvalidPasswordLengthError";
  }
}
