import { Prisma, PrismaClient } from "@prisma/client";
import { NoteEntity } from "../../../../domain/entities/note/index.js";
import {
  NoteFilterParams,
  NoteRepositoryInterface,
} from "../../../../domain/repositories/noteRepositoryInterface.js";
import { prisma } from "../client.js";
import { NoteMapper } from "../mappers/noteMapper.js";

type DbClient = PrismaClient | Prisma.TransactionClient;

const noteInclude = {
  monthlyPlan: {
    select: {
      id: true,
      month: true,
      year: true,
    },
  },
} as const;

export class NoteRepository implements NoteRepositoryInterface {
  constructor(private readonly client: DbClient = prisma) {}

  async findManyByUserId(userId: number, filters: NoteFilterParams): Promise<NoteEntity[]> {
    const planFilter: Prisma.MonthlyPlanWhereInput = { userId };
    if (filters.month !== undefined) planFilter.month = filters.month;
    if (filters.year !== undefined) planFilter.year = filters.year;

    const where: Prisma.NoteWhereInput = {
      monthlyPlan: planFilter,
    };
    if (filters.planId) {
      where.monthlyPlanId = filters.planId;
    }

    const rows = await this.client.note.findMany({
      where,
      include: noteInclude,
      orderBy: [{ createdAt: filters.order || "asc" }, { id: filters.order || "asc" }],
    });
    return rows.map(NoteMapper.toEntity);
  }

  async findByIdAndUserId(id: number, userId: number): Promise<NoteEntity | null> {
    const row = await this.client.note.findFirst({
      where: {
        id,
        monthlyPlan: { userId },
      },
      include: noteInclude,
    });
    return row ? NoteMapper.toEntity(row) : null;
  }

  async create(data: {
    monthlyPlanId: number;
    title: string | null;
    content: string;
  }): Promise<NoteEntity> {
    const created = await this.client.note.create({
      data,
      include: noteInclude,
    });
    return NoteMapper.toEntity(created);
  }

  async update(
    id: number,
    data: {
      title: string | null;
      content: string;
    }
  ): Promise<NoteEntity> {
    const updated = await this.client.note.update({
      where: { id },
      data,
      include: noteInclude,
    });
    return NoteMapper.toEntity(updated);
  }

  async delete(id: number): Promise<void> {
    await this.client.note.delete({ where: { id } });
  }
}
