import {
  InvalidPasswordHashError,
  InvalidUserEmailError,
  InvalidUserNameError,
} from "./errors.js";

export function validateUserName(name: string): void {
  if (!name || name.trim().length < 2 || name.trim().length > 80) {
    throw new InvalidUserNameError();
  }
}

export function validateUserEmail(email: string): void {
  if (!email || email.trim().length === 0) {
    throw new InvalidUserEmailError();
  }
}

export function validatePasswordHash(passwordHash: string): void {
  if (!passwordHash || passwordHash.length === 0) {
    throw new InvalidPasswordHashError();
  }
}
