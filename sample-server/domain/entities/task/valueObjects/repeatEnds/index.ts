import { CalendarDate } from "../calendarDate/index.js";

export abstract class RepeatEnds {
  abstract readonly repeatEndsAtType: string;
  
  abstract isExpired(nextUtcDate: Date): boolean;
  abstract getNewRemainingCount(): number | null;
  abstract equals(other: RepeatEnds): boolean;
}

export class RepeatEndsEndlessly extends RepeatEnds {
  readonly repeatEndsAtType = "endlessly";

  isExpired(nextUtcDate: Date): boolean {
    return false;
  }

  getNewRemainingCount(): number | null {
    return null;
  }

  equals(other: RepeatEnds): boolean {
    return other.repeatEndsAtType === "endlessly";
  }
}

export class RepeatEndsAtDate extends RepeatEnds {
  readonly repeatEndsAtType = "date";
  readonly endsAtDate: CalendarDate;

  constructor(endsAtDate: CalendarDate | string) {
    super();
    this.endsAtDate = endsAtDate instanceof CalendarDate ? endsAtDate : new CalendarDate(endsAtDate);
  }

  isExpired(nextUtcDate: Date): boolean {
    const parsedEndsAt = this.endsAtDate.toNeutralDate();
    if (parsedEndsAt && nextUtcDate.getTime() > parsedEndsAt.getTime()) {
      return true;
    }
    return false;
  }

  getNewRemainingCount(): number | null {
    return null;
  }

  equals(other: RepeatEnds): boolean {
    return other instanceof RepeatEndsAtDate && this.endsAtDate.equals(other.endsAtDate);
  }
}

export class RepeatEndsAtCount extends RepeatEnds {
  readonly repeatEndsAtType = "count";
  readonly count: number;

  constructor(count: number) {
    super();
    this.count = count;
  }

  isExpired(nextUtcDate: Date): boolean {
    return this.count <= 1;
  }

  getNewRemainingCount(): number | null {
    return this.count - 1;
  }

  equals(other: RepeatEnds): boolean {
    return other instanceof RepeatEndsAtCount && this.count === other.count;
  }
}

export function createRepeatEnds(
  repeatEndsAtType: string | null,
  endsAtDate: string | null,
  endsAtCount: number | null
): RepeatEnds {
  const type = repeatEndsAtType || "endlessly";
  switch (type) {
    case "date":
      return new RepeatEndsAtDate(new CalendarDate(endsAtDate));
    case "count":
      return new RepeatEndsAtCount(endsAtCount ?? 0);
    case "endlessly":
    default:
      return new RepeatEndsEndlessly();
  }
}
