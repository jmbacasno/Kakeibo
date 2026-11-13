import { PerfectDayRepositoryInterface } from "../../domain/repositories/perfectDayRepositoryInterface.js";
import { PerfectDayEntity } from "../../domain/entities/perfectDay/index.js";
import { prisma } from "../persistence/clients/prisma.js";
import { PerfectDayModel } from "../persistence/models/perfectDayModel.js";

export class PerfectDayRepository implements PerfectDayRepositoryInterface {
  constructor(private client = prisma) {}

  async findByUserIdAndDate(userId: number, date: string): Promise<PerfectDayEntity | null> {
    const perfectDay = await this.client.perfectDay.findFirst({
      where: { userId, date }
    });
    if (!perfectDay) return null;
    return PerfectDayModel.toEntity(perfectDay);
  }

  async findAllByUserId(userId: number): Promise<PerfectDayEntity[]> {
    const perfectDays = await this.client.perfectDay.findMany({
      where: { userId },
      orderBy: { date: "asc" }
    });
    return perfectDays.map(PerfectDayModel.toEntity);
  }

  async create(perfectDay: PerfectDayEntity): Promise<PerfectDayEntity> {
    const created = await this.client.perfectDay.create({
      data: {
        date: perfectDay.date,
        userId: perfectDay.userId,
      }
    });
    return PerfectDayModel.toEntity(created);
  }

  async update(perfectDay: PerfectDayEntity): Promise<PerfectDayEntity> {
    if (!perfectDay.id) {
      throw new Error("Cannot update a perfect day record without an ID");
    }
    const updated = await this.client.perfectDay.update({
      where: { id: perfectDay.id },
      data: {
        updatedAt: new Date(),
      }
    });
    return PerfectDayModel.toEntity(updated);
  }

  async delete(userId: number, date: string): Promise<void> {
    await this.client.perfectDay.deleteMany({
      where: { userId, date }
    });
  }
}
