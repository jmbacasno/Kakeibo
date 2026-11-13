import { z } from "zod";
import { NoteEntity, NotePlanSummary } from "../../domain/entities/note/index.js";

export const createNoteSchema = z.object({
  monthlyPlanId: z.coerce.number().int().positive("Invalid monthly plan ID"),
  title: z
    .string()
    .trim()
    .max(120, "Title cannot exceed 120 characters")
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
  content: z
    .string()
    .trim()
    .min(1, "Note content is required")
    .max(5000, "Note cannot exceed 5000 characters"),
});

export const updateNoteSchema = z.object({
  title: z
    .string()
    .trim()
    .max(120, "Title cannot exceed 120 characters")
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
  content: z
    .string()
    .trim()
    .min(1, "Note content is required")
    .max(5000, "Note cannot exceed 5000 characters"),
});

export const listNotesQuerySchema = z.object({
  planId: z.coerce.number().int().positive().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  order: z.enum(["asc", "desc"]).optional().default("asc"),
});

export class NoteDTO {
  id!: number;
  monthlyPlanId!: number;
  title!: string | null;
  content!: string;
  createdAt!: string | null;
  updatedAt!: string | null;
  monthlyPlan!: NotePlanSummary | null;

  static fromEntity(note: NoteEntity): NoteDTO {
    return {
      id: note.id!,
      monthlyPlanId: note.monthlyPlanId,
      title: note.title,
      content: note.content,
      createdAt: note.createdAt ? note.createdAt.toISOString() : null,
      updatedAt: note.updatedAt ? note.updatedAt.toISOString() : null,
      monthlyPlan: note.monthlyPlan || null,
    };
  }
}
