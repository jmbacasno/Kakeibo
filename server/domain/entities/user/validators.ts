import {
  InvalidFirstNameError,
  InvalidLastNameError,
  InvalidUserEmailError,
  InvalidUserPasswordError,
} from "./errors.js";

export function validateFirstName(firstName: string): void {
  const trimmed = firstName?.trim() || "";
  if (trimmed.length < 1 || trimmed.length > 50) {
    throw new InvalidFirstNameError();
  }
}

export function validateLastName(lastName: string): void {
  const trimmed = lastName?.trim() || "";
  if (trimmed.length < 1 || trimmed.length > 50) {
    throw new InvalidLastNameError();
  }
}

export function validateUserEmail(email: string): void {
  if (!email || email.trim().length === 0) {
    throw new InvalidUserEmailError();
  }
}

export function validateUserPassword(password: string): void {
  if (!password || password.length === 0) {
    throw new InvalidUserPasswordError();
  }
}
