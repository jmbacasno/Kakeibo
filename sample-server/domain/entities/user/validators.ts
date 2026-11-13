import {
  EmptyEmailError,
  InvalidEmailFormatError,
  EmptyNameError,
  InvalidPasswordLengthError,
} from "./errors.js";

// --- Email Validation Functions ---

export function isEmailNotEmpty(email: string): void {
  if (!email || email.trim() === "") {
    throw new EmptyEmailError();
  }
}

export function isValidEmailFormat(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new InvalidEmailFormatError();
  }
}

export function validateEmail(email: string): void {
  isEmailNotEmpty(email);
  isValidEmailFormat(email);
}

// --- Name Validation Functions ---

export function isNameNotEmpty(name: string | null): void {
  if (name !== null && name.trim() === "") {
    throw new EmptyNameError();
  }
}

export function validateName(name: string | null): void {
  isNameNotEmpty(name);
}

// --- Password Validation Functions ---

export function isPasswordLengthValid(password?: string): void {
  if (password !== undefined && password.length < 6 && !password.startsWith("$2b$")) {
    throw new InvalidPasswordLengthError();
  }
}

export function validatePassword(password?: string): void {
  isPasswordLengthValid(password);
}
