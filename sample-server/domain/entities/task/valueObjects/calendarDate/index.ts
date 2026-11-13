/**
 * CalendarDate is an immutable Value Object representing a calendar date (timezone-neutral).
 * It is used directly within the domain to represent task due dates and repeat end dates,
 * achieving perfect DRY, modularity, and consistency.
 * 
 * It also hosts timezone-neutral and formatted date conversion helper methods to encapsulate
 * date utility operations entirely within the Domain layer.
 */
export class CalendarDate {
  readonly year: number | null;
  readonly month: number | null;
  readonly day: number | null;
  private readonly _value: string | null;

  constructor(value: string | null) {
    this._value = value ? value.trim() : null;
    if (this._value) {
      const parts = this._value.split("-");
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const d = parseInt(parts[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          this.year = y;
          this.month = m;
          this.day = d;
          return;
        }
      }
    }
    this.year = null;
    this.month = null;
    this.day = null;
  }

  /**
   * Gets the raw string value (e.g. "YYYY-MM-DD" or null).
   */
  get value(): string | null {
    return this._value;
  }

  /**
   * Helper to check if a date is specified.
   */
  get exists(): boolean {
    return this._value !== null && this.year !== null && this.month !== null && this.day !== null;
  }

  /**
   * Returns the neutral Date (UTC at midnight).
   */
  toNeutralDate(): Date | null {
    if (this.year === null || this.month === null || this.day === null) {
      return null;
    }
    return new Date(Date.UTC(this.year, this.month - 1, this.day, 0, 0, 0, 0));
  }

  /**
   * Converts the calendar date to a local Date representation (e.g. at local midnight).
   */
  toLocalDate(): Date | null {
    if (this.year === null || this.month === null || this.day === null) {
      return null;
    }
    return new Date(this.year, this.month - 1, this.day, 0, 0, 0, 0);
  }

  /**
   * Static method to create a new CalendarDate object from a Date object.
   */
  static fromDate(date: Date | null): CalendarDate {
    if (!date || isNaN(date.getTime())) {
      return new CalendarDate(null);
    }
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return new CalendarDate(`${year}-${month}-${day}`);
  }

  /**
   * Static method to create a new CalendarDate object from a local Date object.
   */
  static fromLocalDate(date: Date | null): CalendarDate {
    if (!date || isNaN(date.getTime())) {
      return new CalendarDate(null);
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return new CalendarDate(`${year}-${month}-${day}`);
  }

  /**
   * Checks equality with another CalendarDate Value Object.
   */
  equals(other: CalendarDate): boolean {
    return this._value === other.value;
  }
}
