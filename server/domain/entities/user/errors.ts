import { DomainError } from "../../errors.js";

export class InvalidFirstNameError extends DomainError {
  constructor() {
    super("First name must be between 1 and 50 characters", "INVALID_FIRST_NAME");
    this.name = "InvalidFirstNameError";
  }
}

export class InvalidLastNameError extends DomainError {
  constructor() {
    super("Last name must be between 1 and 50 characters", "INVALID_LAST_NAME");
    this.name = "InvalidLastNameError";
  }
}

export class InvalidUserEmailError extends DomainError {
  constructor() {
    super("Email identifier cannot be empty", "INVALID_USER_EMAIL");
    this.name = "InvalidUserEmailError";
  }
}

export class InvalidUserPasswordError extends DomainError {
  constructor() {
    super("Password cannot be empty", "INVALID_USER_PASSWORD");
    this.name = "InvalidUserPasswordError";
  }
}
