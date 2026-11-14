import {
  InvalidCurrencyError,
  InvalidDateFormatError,
  InvalidFirstDayOfWeekError,
  InvalidLanguageError,
  InvalidThemeError,
} from "./errors.js";

export const SUPPORTED_CURRENCIES = [
  "USD",
  "JPY",
  "EUR",
  "GBP",
  "PHP",
  "CAD",
  "AUD",
  "SGD",
] as const;

export const SUPPORTED_LANGUAGES = ["en", "ja"] as const;
export const SUPPORTED_THEMES = ["paper", "light", "dark"] as const;
export const SUPPORTED_DATE_FORMATS = [
  "MMM D, YYYY",
  "YYYY-MM-DD",
  "MM/DD/YYYY",
  "DD/MM/YYYY",
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export type SupportedTheme = (typeof SUPPORTED_THEMES)[number];
export type SupportedDateFormat = (typeof SUPPORTED_DATE_FORMATS)[number];

export function validateCurrency(currency: string): void {
  if (!SUPPORTED_CURRENCIES.includes(currency as SupportedCurrency)) {
    throw new InvalidCurrencyError();
  }
}

export function validateLanguage(language: string): void {
  if (!SUPPORTED_LANGUAGES.includes(language as SupportedLanguage)) {
    throw new InvalidLanguageError();
  }
}

export function validateTheme(theme: string): void {
  if (!SUPPORTED_THEMES.includes(theme as SupportedTheme)) {
    throw new InvalidThemeError();
  }
}

export function validateDateFormat(dateFormat: string): void {
  if (!SUPPORTED_DATE_FORMATS.includes(dateFormat as SupportedDateFormat)) {
    throw new InvalidDateFormatError();
  }
}

export function validateFirstDayOfWeek(firstDayOfWeek: number): void {
  if (!Number.isInteger(firstDayOfWeek) || (firstDayOfWeek !== 0 && firstDayOfWeek !== 1)) {
    throw new InvalidFirstDayOfWeekError();
  }
}
