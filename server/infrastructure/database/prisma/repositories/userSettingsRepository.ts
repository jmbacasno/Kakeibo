import { Prisma, PrismaClient } from "@prisma/client";
import { UserSettingsEntity } from "../../../../domain/entities/userSettings/index.js";
import {
  UpsertUserSettingsData,
  UserSettingsRepositoryInterface,
} from "../../../../domain/repositories/userSettingsRepositoryInterface.js";
import { prisma } from "../client.js";
import { UserSettingsMapper } from "../mappers/userSettingsMapper.js";

type DbClient = PrismaClient | Prisma.TransactionClient;

export class UserSettingsRepository implements UserSettingsRepositoryInterface {
  constructor(private readonly client: DbClient = prisma) {}

  async findByUserId(userId: number): Promise<UserSettingsEntity | null> {
    const raw = await this.client.userSettings.findUnique({ where: { userId } });
    return raw ? UserSettingsMapper.toEntity(raw) : null;
  }

  async create(settings: UserSettingsEntity): Promise<UserSettingsEntity> {
    const created = await this.client.userSettings.create({
      data: {
        userId: settings.userId,
        currency: settings.currency,
        language: settings.language,
        theme: settings.theme,
        dateFormat: settings.dateFormat,
        firstDayOfWeek: settings.firstDayOfWeek,
      },
    });
    return UserSettingsMapper.toEntity(created);
  }

  async upsertByUserId(
    userId: number,
    data: UpsertUserSettingsData
  ): Promise<UserSettingsEntity> {
    const saved = await this.client.userSettings.upsert({
      where: { userId },
      update: {
        currency: data.currency,
        language: data.language,
        theme: data.theme,
        dateFormat: data.dateFormat,
        firstDayOfWeek: data.firstDayOfWeek,
      },
      create: {
        userId,
        currency: data.currency,
        language: data.language,
        theme: data.theme,
        dateFormat: data.dateFormat,
        firstDayOfWeek: data.firstDayOfWeek,
      },
    });
    return UserSettingsMapper.toEntity(saved);
  }
}
