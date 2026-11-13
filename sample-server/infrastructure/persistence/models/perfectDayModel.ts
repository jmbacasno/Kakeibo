import { PerfectDay as PrismaPerfectDay } from "@prisma/client";
import { PerfectDay } from "../../../domain/entities/perfectDay/index.js";

export class PerfectDayModel {
  static toEntity(raw: PrismaPerfectDay): PerfectDay {
    return new PerfectDay({
      id: raw.id,
      date: raw.date,
      userId: raw.userId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
