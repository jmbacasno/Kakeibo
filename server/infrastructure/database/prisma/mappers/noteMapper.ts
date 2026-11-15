import { Note as PrismaNote } from "@prisma/client";
import { Note, NotePlanSummary } from "../../../../domain/entities/note/index.js";

export type PrismaNoteWithPlan = PrismaNote & {
  monthlyPlan?: NotePlanSummary | null;
};

export class NoteMapper {
  static toEntity(raw: PrismaNoteWithPlan): Note {
    return new Note({
      id: raw.id,
      monthlyPlanId: raw.monthlyPlanId,
      title: raw.title,
      content: raw.content,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      monthlyPlan: raw.monthlyPlan || null,
    });
  }
}
