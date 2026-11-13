import { NoteEntity } from "../entities/note/index.js";

export interface NoteFilterParams {
  planId?: number;
  month?: number;
  year?: number;
  order?: "asc" | "desc";
}

export interface NoteRepositoryInterface {
  findManyByUserId(userId: number, filters: NoteFilterParams): Promise<NoteEntity[]>;
  findByIdAndUserId(id: number, userId: number): Promise<NoteEntity | null>;
  create(data: {
    monthlyPlanId: number;
    title: string | null;
    content: string;
  }): Promise<NoteEntity>;
  update(
    id: number,
    data: {
      title: string | null;
      content: string;
    }
  ): Promise<NoteEntity>;
  delete(id: number): Promise<void>;
}
