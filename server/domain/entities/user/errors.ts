import { DomainError } from "../../errors.js";

export class InvalidUserNameError extends DomainError {
  constructor() {
    super("Name must be between 2 and 80 characters", "INVALID_USER_NAME");
    this.name = "InvalidUserNameError";
  }
}

export class InvalidUserEmailError extends DomainError {
  constructor() {
    super("Email identifier cannot be empty", "INVALID_USER_EMAIL");
    this.name = "InvalidUserEmailError";
  }
}

export class InvalidPasswordHashError extends DomainError {
  constructor() {
    super("Password hash cannot be empty", "INVALID_PASSWORD_HASH");
    this.name = "InvalidPasswordHashError";
  }
}
