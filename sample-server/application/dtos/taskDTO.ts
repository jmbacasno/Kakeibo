import { TaskEntity } from "../../domain/entities/task/index.js";
import { Category } from "../../domain/entities/category/index.js";
import { CategoryDTO } from "./categoryDTO.js";
import { z } from "zod";
import { ValidationError } from "../errors.js";

export const stepSchema = z.object({
  id: z.number().nullable().optional(),
  title: z.string().min(1, "Step title is required."),
  isCompleted: z.boolean().default(false),
  customOrder: z.number().default(0)
});

export const createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required."),
  notes: z.string().optional(),
  isImportant: z.boolean().default(false).optional(),
  dueDate: z.string().nullable().optional(),
  repeatType: z.string().optional(),
  categoryId: z.number().nullable().optional(),
  repeatFrequency: z.union([z.number(), z.string()]).nullable().optional(),
  repeatWeeklyOnDays: z.string().nullable().optional(),
  repeatMonthlyOnDay: z.union([z.number(), z.string()]).nullable().optional(),
  repeatEndsAtType: z.string().nullable().optional(),
  repeatEndsAtDateDate: z.string().nullable().optional(),
  repeatEndsAtCountCount: z.union([z.number(), z.string()]).nullable().optional(),
  steps: z.array(stepSchema).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, "Task title cannot be empty.").optional(),
  notes: z.string().nullable().optional(),
  isCompleted: z.boolean().optional(),
  isImportant: z.boolean().optional(),
  dueDate: z.string().nullable().optional(),
  repeatType: z.string().optional(),
  categoryId: z.number().nullable().optional(),
  repeatFrequency: z.union([z.number(), z.string()]).nullable().optional(),
  repeatWeeklyOnDays: z.string().nullable().optional(),
  repeatMonthlyOnDay: z.union([z.number(), z.string()]).nullable().optional(),
  repeatEndsAtType: z.string().nullable().optional(),
  repeatEndsAtDateDate: z.string().nullable().optional(),
  repeatEndsAtCountCount: z.union([z.number(), z.string()]).nullable().optional(),
  steps: z.array(stepSchema).optional(),
});

export type CreateTaskDTO = z.infer<typeof createTaskSchema>;
export type UpdateTaskDTO = z.infer<typeof updateTaskSchema>;

export class StepDTO {
  id!: number | null;
  title!: string;
  isCompleted!: boolean;
  customOrder!: number;
}

export class TaskDTO {
  id!: number;
  title!: string;
  notes!: string;
  isCompleted!: boolean;
  isImportant!: boolean;
  completedAt!: string | null;
  dueDate!: string | null;
  repeatType!: string;
  repeatFrequency!: number | null;
  repeatWeeklyOnDays!: string | null;
  repeatMonthlyOnDay!: number | null;
  repeatEndsAtType!: string;
  repeatEndsAtDateDate!: string | null;
  repeatEndsAtCountCount!: number | null;
  customOrder!: number;
  categoryId!: number | null;
  category?: CategoryDTO | null;
  userId!: number;
  createdAt!: string | null;
  updatedAt!: string | null;
  steps!: StepDTO[];

  static fromEntity(domain: TaskEntity & { category?: Category | null }): TaskDTO {
    if (!domain) {
      throw new ValidationError("Task entity is null or undefined.");
    }
    if (typeof domain.id !== "number" || isNaN(domain.id) || domain.id <= 0) {
      throw new ValidationError(
        "Database persistence validation failed for Task: id must be a valid positive number."
      );
    }
    if (!domain.createdAt || !(domain.createdAt instanceof Date) || isNaN(domain.createdAt.getTime())) {
      throw new ValidationError(
        "Database persistence validation failed for Task: createdAt must be a valid Date object."
      );
    }
    if (!domain.updatedAt || !(domain.updatedAt instanceof Date) || isNaN(domain.updatedAt.getTime())) {
      throw new ValidationError(
        "Database persistence validation failed for Task: updatedAt must be a valid Date object."
      );
    }
    return {
      id: domain.id,
      title: domain.title,
      notes: domain.notes,
      isCompleted: domain.isCompleted,
      isImportant: domain.isImportant,
      completedAt: domain.completedAt ? domain.completedAt.toISOString() : null,
      dueDate: domain.dueDate.value,
      repeatType: domain.repeatRule.repeatType,
      repeatFrequency: domain.repeatRule.repeatFrequency,
      repeatWeeklyOnDays: domain.repeatRule.repeatWeeklyOnDays,
      repeatMonthlyOnDay: domain.repeatRule.repeatMonthlyOnDay,
      repeatEndsAtType: domain.repeatRule.repeatEndsAtType || "endlessly",
      repeatEndsAtDateDate: domain.repeatRule.repeatEndsAtDateDate,
      repeatEndsAtCountCount: domain.repeatRule.repeatEndsAtCountCount,
      customOrder: domain.customOrder,
      categoryId: domain.categoryId,
      category: domain.category ? CategoryDTO.fromEntity(domain.category) : null,
      userId: domain.userId,
      createdAt: domain.createdAt ? domain.createdAt.toISOString() : null,
      updatedAt: domain.updatedAt ? domain.updatedAt.toISOString() : null,
      steps: domain.steps ? domain.steps.map(s => ({
        id: s.id,
        title: s.title,
        isCompleted: s.isCompleted,
        customOrder: s.customOrder
      })) : [],
    };
  }
}
