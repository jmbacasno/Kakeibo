import {
  validateRepeatType,
  validateRepeatFrequency,
  validateRepeatWeeklyOnDays,
  validateRepeatMonthlyOnDay,
  validateRepeatEndsAtType,
  validateRepeatEndsAtDateDate,
  validateRepeatEndsAtCountCount,
} from "../../validators.js";
import {
  MissingRepeatEndsAtDateError,
  MissingRepeatEndsAtCountError,
  RepeatDaysForDailyIntervalError,
  RepeatMonthDayForDailyIntervalError,
  RepeatMonthDayForWeeklyIntervalError,
} from "../../errors.js";
import { Repeat, createRepeat } from "../repeat/index.js";
import { RepeatEnds, createRepeatEnds } from "../repeatEnds/index.js";
import { CalendarDate } from "../calendarDate/index.js";

/**
 * RepeatRule Value Object representing validated, immutable recurrence rules for a scheduled task.
 */
export class RepeatRule {
  // --- Repeat Rule Fields ---

  /** The type of repetition frequency pattern ('none', 'daily', 'weekly', 'monthly', 'yearly') */
  readonly repeatType: string;

  /** Multiplier factor for intervals (e.g., repeatType='daily', repeatFrequency=2 means every 2 days) */
  readonly repeatFrequency: number | null;

  /** Comma-separated list of short weekday codes (e.g. 'MO,WE,FR') denoting schedule days */
  readonly repeatWeeklyOnDays: string | null;

  /** Numeric day number within a month (e.g., 15 for the 15th, or -1 for the last calendar day) */
  readonly repeatMonthlyOnDay: number | null;

  /** Boundary logic indicator for when repetitions terminate ('date', 'count', 'endlessly') */
  readonly repeatEndsAtType: string | null;

  /** A timezone-neutral cutoff date string beyond which instances do not recur */
  readonly repeatEndsAtDateDate: string | null;

  /** The limit on the number of generated recurrences to trigger */
  readonly repeatEndsAtCountCount: number | null;

  // --- Encapsulated Sub-Value Objects ---
  readonly repeat: Repeat;
  readonly ends: RepeatEnds;

  constructor(data: {
    repeatType?: string;
    repeatFrequency?: number | null;
    repeatWeeklyOnDays?: string | null;
    repeatMonthlyOnDay?: number | null;
    repeatEndsAtType?: string | null;
    repeatEndsAtDateDate?: string | null;
    repeatEndsAtCountCount?: number | null;
  }) {
    this.repeatType = data.repeatType || "none";
    this.repeatFrequency = data.repeatFrequency ?? null;
    this.repeatWeeklyOnDays = data.repeatWeeklyOnDays ?? null;
    this.repeatMonthlyOnDay = data.repeatMonthlyOnDay ?? null;
    this.repeatEndsAtType = data.repeatEndsAtType ?? null;
    this.repeatEndsAtDateDate = data.repeatEndsAtDateDate ?? null;
    this.repeatEndsAtCountCount = data.repeatEndsAtCountCount ?? null;

    this.validate();

    // Instantiate encapsulated sub-value objects
    this.repeat = createRepeat(
      this.repeatType,
      this.repeatFrequency,
      this.repeatWeeklyOnDays,
      this.repeatMonthlyOnDay
    );
    this.ends = createRepeatEnds(
      this.repeatEndsAtType,
      this.repeatEndsAtDateDate,
      this.repeatEndsAtCountCount
    );
  }

  static validateRepeatType(repeatType: string): void {
    validateRepeatType(repeatType);
  }

  static validateRepeatFrequency(repeatFrequency: number | null): void {
    validateRepeatFrequency(repeatFrequency);
  }

  static validateRepeatWeeklyOnDays(repeatWeeklyOnDays: string | null): void {
    validateRepeatWeeklyOnDays(repeatWeeklyOnDays);
  }

  static validateRepeatMonthlyOnDay(repeatMonthlyOnDay: number | null): void {
    validateRepeatMonthlyOnDay(repeatMonthlyOnDay);
  }

  static validateRepeatEndsAtType(repeatEndsAtType: string | null): void {
    validateRepeatEndsAtType(repeatEndsAtType);
  }

  static validateRepeatEndsAtDateDate(repeatEndsAtDateDate: string | null): void {
    validateRepeatEndsAtDateDate(repeatEndsAtDateDate);
  }

  static validateRepeatEndsAtCountCount(repeatEndsAtCountCount: number | null): void {
    validateRepeatEndsAtCountCount(repeatEndsAtCountCount);
  }

  validate(): void {
    validateRepeatType(this.repeatType);
    validateRepeatFrequency(this.repeatFrequency);
    validateRepeatWeeklyOnDays(this.repeatWeeklyOnDays);
    validateRepeatMonthlyOnDay(this.repeatMonthlyOnDay);
    validateRepeatEndsAtType(this.repeatEndsAtType);
    validateRepeatEndsAtDateDate(this.repeatEndsAtDateDate);
    validateRepeatEndsAtCountCount(this.repeatEndsAtCountCount);

    // --- CONDITIONAL (CROSS-ATTRIBUTE) VALIDATIONS ---

    // 1. If repeatEndsAtType is 'date', we must have a valid repeatEndsAtDateDate.
    if (this.repeatEndsAtType === "date" && !this.repeatEndsAtDateDate) {
      throw new MissingRepeatEndsAtDateError();
    }

    // 2. If repeatEndsAtType is 'count', we must have a valid, non-null repeatEndsAtCountCount.
    if (this.repeatEndsAtType === "count" && this.repeatEndsAtCountCount === null) {
      throw new MissingRepeatEndsAtCountError();
    }

    // 3. If repeatType is "daily", weekly or monthly properties shouldn't be defined.
    if (this.repeatType === "daily") {
      if (this.repeatWeeklyOnDays) {
        throw new RepeatDaysForDailyIntervalError();
      }
      if (this.repeatMonthlyOnDay !== null) {
        throw new RepeatMonthDayForDailyIntervalError();
      }
    }

    // 4. If repeatType is "weekly", monthly properties shouldn't be defined.
    if (this.repeatType === "weekly") {
      if (this.repeatMonthlyOnDay !== null) {
        throw new RepeatMonthDayForWeeklyIntervalError();
      }
    }
  }

  /**
   * Calculates the next due date using encapsulated Value Object strategy execution.
   */
  getNextDueDate(dueDate: CalendarDate): CalendarDate | null {
    if (!dueDate.exists || this.repeatType === "none") {
      return null;
    }

    const localDate = dueDate.toLocalDate();
    if (!localDate) {
      return null;
    }

    // Delegate behavior to Repeat Value Object subclass
    const nextLocalDate = this.repeat.getNextDate(localDate);
    if (!nextLocalDate) {
      return null;
    }

    const nextUtcDate = new Date(Date.UTC(nextLocalDate.getFullYear(), nextLocalDate.getMonth(), nextLocalDate.getDate(), 0, 0, 0, 0));

    // Delegate boundary check to RepeatEnds Value Object subclass
    if (this.ends.isExpired(nextUtcDate)) {
      return null;
    }

    return CalendarDate.fromLocalDate(nextLocalDate);
  }

  /**
   * Evaluates the recurrence state transition, moving procedural RecurrenceService code into the Rich Value Object.
   */
  evaluate(
    dueDate: CalendarDate,
    becameCompleted: boolean,
    previouslyCompleted: boolean
  ): {
    shouldSpawn: boolean;
    nextDueDate: CalendarDate | null;
    newRemainingCount: number | null;
  } {
    if (!becameCompleted || previouslyCompleted) {
      return { shouldSpawn: false, nextDueDate: null, newRemainingCount: null };
    }

    const nextDate = this.getNextDueDate(dueDate);
    if (!nextDate) {
      return { shouldSpawn: false, nextDueDate: null, newRemainingCount: null };
    }

    const newRemainingCount = this.ends.getNewRemainingCount();

    return {
      shouldSpawn: true,
      nextDueDate: nextDate,
      newRemainingCount,
    };
  }

  /**
   * Checks equality with another RepeatRule Value Object.
   */
  equals(other: RepeatRule): boolean {
    return (
      this.repeat.equals(other.repeat) &&
      this.ends.equals(other.ends)
    );
  }
}
