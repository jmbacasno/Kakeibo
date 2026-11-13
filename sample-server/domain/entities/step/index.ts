import { validateTitle, validateCustomOrder, validateTaskId } from "./validators.js";

export interface StepEntity {
  // --- Fields ---

  /** Unique database ID assigned upon save, null for unsaved models */
  id: number | null;

  /** The short label or title of the checklist sub-step */
  title: string;

  /** Status flag denoting whether this checklist step is checked off */
  isCompleted: boolean;

  /** An integer custom sort position among companion steps under the same parent task */
  customOrder: number;

  /** The parent task ID to which this step belongs */
  taskId: number;

  /** Timestamp recording when this checklist step was created */
  createdAt: Date | null;

  /** Timestamp recording when this checklist step was last modified */
  updatedAt: Date | null;
}

export class Step implements StepEntity {
  // --- Identity & Primitive Fields ---

  /** Unique database ID assigned upon save, null for unsaved models */
  id: number | null;

  /** The short label or title of the checklist sub-step */
  title: string;

  /** Status flag denoting whether this checklist step is checked off */
  isCompleted: boolean;

  /** An integer custom sort position among companion steps under the same parent task */
  customOrder: number;

  /** The parent task ID to which this step belongs */
  taskId: number;

  /** Timestamp recording when this checklist step was created */
  createdAt: Date | null;

  /** Timestamp recording when this checklist step was last modified */
  updatedAt: Date | null;

  constructor(data: {
    id?: number | null;
    title: string;
    isCompleted?: boolean;
    customOrder?: number;
    taskId: number;
    createdAt?: Date | null;
    updatedAt?: Date | null;
  }) {
    this.id = data.id ?? null;
    this.title = data.title;
    this.isCompleted = data.isCompleted ?? false;
    this.customOrder = data.customOrder ?? 0;
    this.taskId = data.taskId;
    this.createdAt = data.createdAt ?? null;
    this.updatedAt = data.updatedAt ?? null;

    this.validate();
  }

  static validateTitle(title: string): void {
    validateTitle(title);
  }

  static validateCustomOrder(customOrder: number): void {
    validateCustomOrder(customOrder);
  }

  validate(): void {
    validateTitle(this.title);
    validateCustomOrder(this.customOrder);
    validateTaskId(this.taskId);
  }

  update(data: Partial<Omit<StepEntity, "id" | "taskId" | "createdAt" | "updatedAt">>): this {
    if (data.title !== undefined) {
      validateTitle(data.title);
      this.title = data.title;
    }
    if (data.isCompleted !== undefined) {
      this.isCompleted = !!data.isCompleted;
    }
    if (data.customOrder !== undefined) {
      validateCustomOrder(data.customOrder);
      this.customOrder = data.customOrder;
    }
    this.updatedAt = new Date();
    this.validate();
    return this;
  }
}
