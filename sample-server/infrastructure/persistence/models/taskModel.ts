import { Task as PrismaTask, Category as PrismaCategory, Step as PrismaStep } from "@prisma/client";
import { Task, RepeatRule } from "../../../domain/entities/task/index.js";
import { CategoryModel } from "./categoryModel.js";
import { Category } from "../../../domain/entities/category/index.js";
import { Step } from "../../../domain/entities/step/index.js";

export interface PrismaTaskWithCategory extends PrismaTask {
  category?: PrismaCategory | null;
  steps?: PrismaStep[];
}

export interface TaskEntityWithCategory extends Task {
  category?: Category | null;
}

export class TaskModel {
  static toEntity(raw: PrismaTaskWithCategory): TaskEntityWithCategory {
    const task = new Task({
      id: raw.id,
      title: raw.title,
      notes: raw.notes,
      isCompleted: raw.isCompleted,
      isImportant: raw.isImportant,
      completedAt: raw.completedAt,
      dueDate: raw.dueDate,
      repeatRule: new RepeatRule({
        repeatType: raw.repeatType,
        repeatFrequency: raw.repeatFrequency,
        repeatWeeklyOnDays: raw.repeatWeeklyOnDays,
        repeatMonthlyOnDay: raw.repeatMonthlyOnDay,
        repeatEndsAtType: raw.repeatEndsAtType,
        repeatEndsAtDateDate: raw.repeatEndsAtDateDate,
        repeatEndsAtCountCount: raw.repeatEndsAtCountCount,
      }),
      customOrder: raw.customOrder,
      categoryId: raw.categoryId,
      userId: raw.userId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      steps: raw.steps ? raw.steps.map(s => new Step({
        id: s.id,
        title: s.title,
        isCompleted: s.isCompleted,
        customOrder: s.customOrder,
        taskId: s.taskId,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt
      })) : undefined
    });

    const taskWithCat = task as TaskEntityWithCategory;
    if (raw.category) {
      taskWithCat.category = CategoryModel.toEntity(raw.category);
    }
    return taskWithCat;
  }
}
