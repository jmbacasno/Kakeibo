import { Step, StepEntity } from "../step/index.js";
import { RepeatRule } from "./valueObjects/repeatRule/index.js";
import { CalendarDate } from "./valueObjects/calendarDate/index.js";
import { RepeatRuleRequiresDueDateError } from "./errors.js";
import {
  validateTitle,
  validateNotes,
  validateDueDate,
  validateUserId,
  validateIsCompleted,
  validateCompletedAt,
  validateCustomOrder,
  validateCategoryId,
} from "./validators.js";

export { RepeatRule, CalendarDate };

export interface TaskEntity {
  // --- Task Fields ---

  /** Unique database ID assigned upon save, null for unsaved models */
  id: number | null;

  /** The core title or instruction summary of the task */
  title: string;

  /** Long text descriptive notes or metadata about the task, nullable */
  notes: string | null;

  /** Status flag marking whether the task is complete */
  isCompleted: boolean;

  /** Pin state highlighting whether the task is important */
  isImportant: boolean;

  /** The physical date and time this task was marked as completed */
  completedAt: Date | null;

  /** Cutoff timeline date Value Object */
  dueDate: CalendarDate;

  /** Encapsulated schedule object controlling recurrence rule patterns */
  repeatRule: RepeatRule;

  /** Custom sequence float position used to control list ordering */
  customOrder: number;

  /** The category grouping ID to which this task belongs, nullable */
  categoryId: number | null;

  /** The unique user identifier owning this task */
  userId: number;

  /** Creation timestamp logged automatically when first persisted */
  createdAt: Date | null;

  /** Modified timestamp logged automatically on save operations */
  updatedAt: Date | null;

  /** Sub-checklist steps nested under this task */
  steps?: StepEntity[];

  evaluateRecurrence(becameCompleted: boolean, previouslyCompleted: boolean): {
    shouldSpawn: boolean;
    nextDueDate: CalendarDate | null;
    newRemainingCount: number | null;
  };
}

export class Task implements TaskEntity {
  // --- Identity, State, & Primitive Fields ---

  /** Unique database ID assigned upon save, null for unsaved models */
  id: number | null;

  /** The core title or instruction summary of the task */
  title: string;

  /** Long text descriptive notes or metadata about the task, nullable */
  notes: string | null;

  /** Status flag marking whether the task is complete */
  isCompleted: boolean;

  /** Pin state highlighting whether the task is important */
  isImportant: boolean;

  /** The physical date and time this task was marked as completed */
  completedAt: Date | null;

  /** Cutoff timeline date Value Object */
  dueDate: CalendarDate;

  /** Encapsulated schedule object controlling recurrence rule patterns */
  repeatRule: RepeatRule;

  /** Custom sequence float position used to control list ordering */
  customOrder: number;

  /** The category grouping ID to which this task belongs, nullable */
  categoryId: number | null;

  /** The unique user identifier owning this task */
  userId: number;

  /** Creation timestamp logged automatically when first persisted */
  createdAt: Date | null;

  /** Modified timestamp logged automatically on save operations */
  updatedAt: Date | null;

  /** Sub-checklist steps nested under this task */
  steps?: Step[];

  constructor(data: {
    id?: number | null;
    title: string;
    notes?: string | null;
    isCompleted?: boolean;
    isImportant?: boolean;
    completedAt?: Date | null;
    dueDate?: CalendarDate | string | null;
    repeatRule: RepeatRule;
    customOrder?: number;
    categoryId?: number | null;
    userId: number;
    createdAt?: Date | null;
    updatedAt?: Date | null;
    steps?: Step[];
  }) {
    this.id = data.id ?? null;
    this.title = data.title;
    this.notes = data.notes ?? null;
    this.isCompleted = data.isCompleted ?? false;
    this.isImportant = data.isImportant ?? false;
    this.completedAt = data.completedAt ?? null;
    this.dueDate = data.dueDate instanceof CalendarDate ? data.dueDate : new CalendarDate(data.dueDate ?? null);
    this.repeatRule = data.repeatRule;
    this.customOrder = data.customOrder ?? 0;
    this.categoryId = data.categoryId ?? null;
    this.userId = data.userId;
    this.createdAt = data.createdAt ?? null;
    this.updatedAt = data.updatedAt ?? null;
    this.steps = data.steps;

    this.validate();
  }

  static validateTitle(title: string): void {
    validateTitle(title);
  }

  static validateUserId(userId: number): void {
    validateUserId(userId);
  }

  static validateNotes(notes: string | null): void {
    validateNotes(notes);
  }

  static validateIsCompleted(isCompleted: boolean): void {
    validateIsCompleted(isCompleted);
  }

  static validateDueDate(dueDate: string | null): void {
    validateDueDate(dueDate);
  }

  static validateCompletedAt(completedAt: Date | null): void {
    validateCompletedAt(completedAt);
  }

  static validateCustomOrder(customOrder: number): void {
    validateCustomOrder(customOrder);
  }

  static validateCategoryId(categoryId: number | null): void {
    validateCategoryId(categoryId);
  }

  validate(): void {
    validateTitle(this.title);
    validateNotes(this.notes);
    validateDueDate(this.dueDate.value);
    validateUserId(this.userId);
    validateIsCompleted(this.isCompleted);
    validateCompletedAt(this.completedAt);
    validateCustomOrder(this.customOrder);
    validateCategoryId(this.categoryId);
    this.repeatRule.validate();

    if (this.repeatRule.repeatType !== "none" && !this.dueDate.exists) {
      throw new RepeatRuleRequiresDueDateError();
    }
  }

  update(data: Partial<Omit<TaskEntity, "id" | "createdAt" | "updatedAt">>): this {
    if (data.title !== undefined) {
      validateTitle(data.title);
      this.title = data.title;
    }
    if (data.notes !== undefined) {
      validateNotes(data.notes);
      this.notes = data.notes;
    }
    if (data.isCompleted !== undefined) {
      validateIsCompleted(data.isCompleted);
      this.isCompleted = data.isCompleted;
    }
    if (data.isImportant !== undefined) {
      this.isImportant = data.isImportant;
    }
    if (data.completedAt !== undefined) {
      validateCompletedAt(data.completedAt);
      this.completedAt = data.completedAt;
    }
    if (data.dueDate !== undefined) {
      this.dueDate = data.dueDate instanceof CalendarDate ? data.dueDate : new CalendarDate(data.dueDate ?? null);
    }
    if (data.repeatRule !== undefined) {
      this.repeatRule = data.repeatRule;
    }
    if (data.customOrder !== undefined) {
      validateCustomOrder(data.customOrder);
      this.customOrder = data.customOrder;
    }
    if (data.categoryId !== undefined) {
      validateCategoryId(data.categoryId);
      this.categoryId = data.categoryId;
    }
    if (data.userId !== undefined) {
      validateUserId(data.userId);
      this.userId = data.userId;
    }
    this.updatedAt = new Date();
    this.validate();
    return this;
  }

  evaluateRecurrence(becameCompleted: boolean, previouslyCompleted: boolean): {
    shouldSpawn: boolean;
    nextDueDate: CalendarDate | null;
    newRemainingCount: number | null;
  } {
    return this.repeatRule.evaluate(this.dueDate, becameCompleted, previouslyCompleted);
  }
}
