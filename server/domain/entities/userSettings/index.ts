import {
  SupportedCurrency,
  SupportedDateFormat,
  SupportedLanguage,
  SupportedTheme,
  validateCurrency,
  validateDateFormat,
  validateFirstDayOfWeek,
  validateLanguage,
  validateTheme,
} from "./validators.js";

export const DEFAULT_USER_SETTINGS = {
  currency: "USD" as SupportedCurrency,
  language: "en" as SupportedLanguage,
  theme: "paper" as SupportedTheme,
  dateFormat: "MMM D, YYYY" as SupportedDateFormat,
  firstDayOfWeek: 0,
};

export interface UserSettingsEntity {
  id: number | null;
  userId: number;
  currency: string;
  language: string;
  theme: string;
  dateFormat: string;
  firstDayOfWeek: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class UserSettings implements UserSettingsEntity {
  id: number | null;
  userId: number;
  currency: string;
  language: string;
  theme: string;
  dateFormat: string;
  firstDayOfWeek: number;
  createdAt: Date | null;
  updatedAt: Date | null;

  constructor(data: UserSettingsEntity) {
    this.id = data.id;
    this.userId = data.userId;
    this.currency = data.currency.trim().toUpperCase();
    this.language = data.language.trim().toLowerCase();
    this.theme = data.theme.trim().toLowerCase();
    this.dateFormat = data.dateFormat.trim();
    this.firstDayOfWeek = data.firstDayOfWeek;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;

    this.validate();
  }

  validate(): void {
    validateCurrency(this.currency);
    validateLanguage(this.language);
    validateTheme(this.theme);
    validateDateFormat(this.dateFormat);
    validateFirstDayOfWeek(this.firstDayOfWeek);
  }
}
