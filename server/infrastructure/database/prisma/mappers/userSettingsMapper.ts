import { UserSettings as PrismaUserSettings } from "@prisma/client";
import { UserSettings } from "../../../../domain/entities/userSettings/index.js";

export class UserSettingsMapper {
  static toEntity(raw: PrismaUserSettings): UserSettings {
    return new UserSettings({
      id: raw.id,
      userId: raw.userId,
      currency: raw.currency,
      language: raw.language,
      theme: raw.theme,
      dateFormat: raw.dateFormat,
      firstDayOfWeek: raw.firstDayOfWeek,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
