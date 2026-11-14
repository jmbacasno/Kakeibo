import { UserSettingsEntity } from "../entities/userSettings/index.js";

export interface UpsertUserSettingsData {
  currency: string;
  language: string;
  theme: string;
  dateFormat: string;
  firstDayOfWeek: number;
}

export interface UserSettingsRepositoryInterface {
  findByUserId(userId: number): Promise<UserSettingsEntity | null>;
  create(settings: UserSettingsEntity): Promise<UserSettingsEntity>;
  upsertByUserId(userId: number, data: UpsertUserSettingsData): Promise<UserSettingsEntity>;
}
