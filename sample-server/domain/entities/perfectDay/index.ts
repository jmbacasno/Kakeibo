import { validateDate, validateUserId } from "./validators.js";

export interface PerfectDayEntity {
  // --- Fields ---

  /** Unique database ID assigned upon save, null for unsaved models */
  id: number | null;

  /** A "YYYY-MM-DD" timezone-neutral calendar date string representing the specific perfect day */
  date: string;

  /** The unique user ID of the profile owner for whom this perfect day is logged */
  userId: number;

  /** Timestamp indicating when this perfect day milestone was first persisted */
  createdAt: Date | null;

  /** Timestamp indicating when this perfect day record was last modified */
  updatedAt: Date | null;
}

export class PerfectDay implements PerfectDayEntity {
  // --- Identity & Primitive Fields ---

  /** Unique database ID assigned upon save, null for unsaved models */
  id: number | null;

  /** A "YYYY-MM-DD" timezone-neutral calendar date string representing the specific perfect day */
  date: string;

  /** The unique user ID of the profile owner for whom this perfect day is logged */
  userId: number;

  /** Timestamp indicating when this perfect day milestone was first persisted */
  createdAt: Date | null;

  /** Timestamp indicating when this perfect day record was last modified */
  updatedAt: Date | null;

  constructor(data: PerfectDayEntity) {
    this.id = data.id;
    this.date = data.date;
    this.userId = data.userId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;

    this.validate();
  }

  static validateDate(date: string): void {
    validateDate(date);
  }

  static validateUserId(userId: number): void {
    validateUserId(userId);
  }

  validate(): void {
    validateUserId(this.userId);
    validateDate(this.date);
  }
}
