import {
  EmptyPerfectDayDateError,
  InvalidPerfectDayDateFormatError,
  InvalidPerfectDayUserIdError,
} from "./errors.js";

// --- Date Validation Functions ---

export function isPerfectDayDateNotEmpty(date: string): void {
  if (!date || date.trim() === "") {
    throw new EmptyPerfectDayDateError();
  }
}

export function isPerfectDayDateFormatValid(date: string): void {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) {
    throw new InvalidPerfectDayDateFormatError();
  }
}

export function validateDate(date: string): void {
  isPerfectDayDateNotEmpty(date);
  isPerfectDayDateFormatValid(date);
}

// --- User ID Validation Functions ---

export function isPerfectDayUserIdValid(userId: number): void {
  if (userId < 0) {
    throw new InvalidPerfectDayUserIdError();
  }
}

export function validateUserId(userId: number): void {
  isPerfectDayUserIdValid(userId);
}
