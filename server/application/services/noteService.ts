import { Note } from "../../domain/entities/note/index.js";
import { UnitOfWorkInterface } from "../../domain/repositories/unitOfWorkInterface.js";
import {
  createNoteSchema,
  listNotesQuerySchema,
  NoteDTO,
  updateNoteSchema,
} from "../dtos/noteDTO.js";
import { NotFoundError } from "../errors.js";
import { parseDTO } from "../validation.js";

export class NoteService {
  constructor(private readonly uow: UnitOfWorkInterface) {}

  async listNotes(userId: number, rawQuery: unknown): Promise<NoteDTO[]> {
    const query = parseDTO(listNotesQuerySchema, rawQuery || {});
    const notes = await this.uow.notes.findManyByUserId(userId, {
      planId: query.planId,
      month: query.month,
      year: query.year,
      order: query.order,
    });
    return notes.map((n) => NoteDTO.fromEntity(n));
  }

  async getNoteById(userId: number, noteId: number): Promise<NoteDTO> {
    const note = await this.uow.notes.findByIdAndUserId(noteId, userId);
    if (!note) {
      throw new NotFoundError("Note not found.");
    }
    return NoteDTO.fromEntity(note);
  }

  async createNote(userId: number, rawData: unknown): Promise<NoteDTO> {
    const input = parseDTO(createNoteSchema, rawData);

    const plan = await this.uow.monthlyPlans.findByIdAndUserId(input.monthlyPlanId, userId);
    if (!plan) {
      throw new NotFoundError("Monthly plan not found.");
    }

    const entity = new Note({
      id: null,
      monthlyPlanId: plan.id!,
      title: input.title ?? null,
      content: input.content,
      createdAt: null,
      updatedAt: null,
    });

    const created = await this.uow.notes.create({
      monthlyPlanId: entity.monthlyPlanId,
      title: entity.title,
      content: entity.content,
    });

    return NoteDTO.fromEntity(created);
  }

  async updateNote(userId: number, noteId: number, rawData: unknown): Promise<NoteDTO> {
    const input = parseDTO(updateNoteSchema, rawData);

    const existing = await this.uow.notes.findByIdAndUserId(noteId, userId);
    if (!existing) {
      throw new NotFoundError("Note not found.");
    }

    const entity = new Note({
      ...existing,
      title: input.title !== undefined ? input.title : existing.title,
      content: input.content,
    });

    const updated = await this.uow.notes.update(noteId, {
      title: entity.title,
      content: entity.content,
    });

    return NoteDTO.fromEntity(updated);
  }

  async deleteNote(userId: number, noteId: number): Promise<void> {
    const existing = await this.uow.notes.findByIdAndUserId(noteId, userId);
    if (!existing) {
      throw new NotFoundError("Note not found.");
    }
    await this.uow.notes.delete(noteId);
  }
}
