import { DEFAULT_USER_SETTINGS, UserSettings } from "../../domain/entities/userSettings/index.js";
import { UnitOfWorkInterface } from "../../domain/repositories/unitOfWorkInterface.js";
import { UserSettingsDTO, updateUserSettingsSchema } from "../dtos/userSettingsDTO.js";
import { NotFoundError } from "../errors.js";
import { parseDTO } from "../validation.js";

export class UserSettingsService {
  constructor(private readonly uow: UnitOfWorkInterface) {}

  async getSettings(userId: number): Promise<UserSettingsDTO> {
    const user = await this.uow.users.findById(userId);
    if (!user) {
      throw new NotFoundError("User account not found.");
    }

    let settings = await this.uow.userSettings.findByUserId(userId);
    if (!settings) {
      const now = new Date();
      const defaultEntity = new UserSettings({
        id: null,
        userId,
        currency: DEFAULT_USER_SETTINGS.currency,
        language: DEFAULT_USER_SETTINGS.language,
        theme: DEFAULT_USER_SETTINGS.theme,
        dateFormat: DEFAULT_USER_SETTINGS.dateFormat,
        firstDayOfWeek: DEFAULT_USER_SETTINGS.firstDayOfWeek,
        createdAt: now,
        updatedAt: now,
      });
      settings = await this.uow.userSettings.create(defaultEntity);
    }

    return UserSettingsDTO.fromEntity(settings);
  }

  async updateSettings(userId: number, rawData: unknown): Promise<UserSettingsDTO> {
    const input = parseDTO(updateUserSettingsSchema, rawData);

    const user = await this.uow.users.findById(userId);
    if (!user) {
      throw new NotFoundError("User account not found.");
    }

    const existing = await this.uow.userSettings.findByUserId(userId);
    const now = new Date();

    const nextEntity = new UserSettings({
      id: existing?.id ?? null,
      userId,
      currency: input.currency ?? existing?.currency ?? DEFAULT_USER_SETTINGS.currency,
      language: input.language ?? existing?.language ?? DEFAULT_USER_SETTINGS.language,
      theme: input.theme ?? existing?.theme ?? DEFAULT_USER_SETTINGS.theme,
      dateFormat: input.dateFormat ?? existing?.dateFormat ?? DEFAULT_USER_SETTINGS.dateFormat,
      firstDayOfWeek:
        input.firstDayOfWeek ?? existing?.firstDayOfWeek ?? DEFAULT_USER_SETTINGS.firstDayOfWeek,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });

    const saved = await this.uow.userSettings.upsertByUserId(userId, {
      currency: nextEntity.currency,
      language: nextEntity.language,
      theme: nextEntity.theme,
      dateFormat: nextEntity.dateFormat,
      firstDayOfWeek: nextEntity.firstDayOfWeek,
    });

    return UserSettingsDTO.fromEntity(saved);
  }
}
