import { z } from "zod";
import { UserSettingsEntity } from "../../domain/entities/userSettings/index.js";
import {
  SUPPORTED_CURRENCIES,
  SUPPORTED_DATE_FORMATS,
  SUPPORTED_LANGUAGES,
  SUPPORTED_THEMES,
} from "../../domain/entities/userSettings/validators.js";

export const updateUserSettingsSchema = z
  .object({
    currency: z
      .string()
      .trim()
      .toUpperCase()
      .refine((val) => (SUPPORTED_CURRENCIES as readonly string[]).includes(val), {
        message: "Unsupported currency code",
      })
      .optional(),
    language: z
      .string()
      .trim()
      .toLowerCase()
      .refine((val) => (SUPPORTED_LANGUAGES as readonly string[]).includes(val), {
        message: "Unsupported language code",
      })
      .optional(),
    theme: z
      .string()
      .trim()
      .toLowerCase()
      .refine((val) => (SUPPORTED_THEMES as readonly string[]).includes(val), {
        message: "Theme must be system, light, or dark",
      })
      .optional(),
    dateFormat: z
      .string()
      .trim()
      .refine((val) => (SUPPORTED_DATE_FORMATS as readonly string[]).includes(val), {
        message: "Unsupported date format",
      })
      .optional(),
    firstDayOfWeek: z
      .number()
      .int("First day of week must be 0 (Sunday) or 1 (Monday)")
      .refine((val) => val === 0 || val === 1, {
        message: "First day of week must be 0 (Sunday) or 1 (Monday)",
      })
      .optional(),
  })
  .strict();

export type UpdateUserSettingsInputDTO = z.infer<typeof updateUserSettingsSchema>;

export class UserSettingsDTO {
  id!: number;
  userId!: number;
  currency!: string;
  language!: string;
  theme!: string;
  dateFormat!: string;
  firstDayOfWeek!: number;
  createdAt!: string | null;
  updatedAt!: string | null;

  static fromEntity(settings: UserSettingsEntity): UserSettingsDTO {
    return {
      id: settings.id!,
      userId: settings.userId,
      currency: settings.currency,
      language: settings.language,
      theme: settings.theme,
      dateFormat: settings.dateFormat,
      firstDayOfWeek: settings.firstDayOfWeek,
      createdAt: settings.createdAt ? settings.createdAt.toISOString() : null,
      updatedAt: settings.updatedAt ? settings.updatedAt.toISOString() : null,
    };
  }
}
