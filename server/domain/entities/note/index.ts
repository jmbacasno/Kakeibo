import { validateNoteContent } from "./validators.js";

export interface NotePlanSummary {
  id: number;
  month: number;
  year: number;
}

export interface NoteEntity {
  id: number | null;
  monthlyPlanId: number;
  title: string | null;
  content: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  monthlyPlan?: NotePlanSummary | null;
}

export class Note implements NoteEntity {
  id: number | null;
  monthlyPlanId: number;
  title: string | null;
  content: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  monthlyPlan?: NotePlanSummary | null;

  constructor(data: NoteEntity) {
    this.id = data.id;
    this.monthlyPlanId = data.monthlyPlanId;
    this.title = data.title ? data.title.trim() : null;
    this.content = data.content.trim();
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.monthlyPlan = data.monthlyPlan;

    this.validate();
  }

  validate(): void {
    validateNoteContent(this.content);
  }
}
