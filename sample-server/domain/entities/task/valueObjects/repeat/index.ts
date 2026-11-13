import rrulePkg from "rrule";
const { RRule } = rrulePkg;

export abstract class Repeat {
  abstract readonly repeatType: string;
  abstract getNextDate(dtstart: Date): Date | null;
  abstract equals(other: Repeat): boolean;
}

export class NoRepeat extends Repeat {
  readonly repeatType = "none";

  getNextDate(dtstart: Date): Date | null {
    return null;
  }

  equals(other: Repeat): boolean {
    return other.repeatType === "none";
  }
}

export class DailyRepeat extends Repeat {
  readonly repeatType = "daily";
  readonly frequency: number;

  constructor(frequency: number | null) {
    super();
    this.frequency = frequency ?? 1;
  }

  getNextDate(dtstart: Date): Date | null {
    try {
      const rule = new RRule({
        freq: RRule.DAILY,
        interval: this.frequency,
        dtstart,
      });
      return rule.after(dtstart);
    } catch {
      return null;
    }
  }

  equals(other: Repeat): boolean {
    return other instanceof DailyRepeat && this.frequency === other.frequency;
  }
}

export class WeeklyRepeat extends Repeat {
  readonly repeatType = "weekly";
  readonly frequency: number;
  readonly weeklyOnDays: string | null;

  constructor(frequency: number | null, weeklyOnDays: string | null) {
    super();
    this.frequency = frequency ?? 1;
    this.weeklyOnDays = weeklyOnDays;
  }

  getNextDate(dtstart: Date): Date | null {
    try {
      const rruleOptions: any = {
        freq: RRule.WEEKLY,
        interval: this.frequency,
        dtstart,
      };
      if (this.weeklyOnDays) {
        const dayMap: Record<string, any> = {
          Sun: RRule.SU,
          Mon: RRule.MO,
          Tue: RRule.TU,
          Wed: RRule.WE,
          Thu: RRule.TH,
          Fri: RRule.FR,
          Sat: RRule.SA,
        };
        const days = this.weeklyOnDays.split(",").map(d => d.trim()).filter(Boolean);
        const byweekday = days.map(d => dayMap[d]).filter(Boolean);
        if (byweekday.length > 0) {
          rruleOptions.byweekday = byweekday;
        }
      }
      const rule = new RRule(rruleOptions);
      return rule.after(dtstart);
    } catch {
      return null;
    }
  }

  equals(other: Repeat): boolean {
    return (
      other instanceof WeeklyRepeat &&
      this.frequency === other.frequency &&
      this.weeklyOnDays === other.weeklyOnDays
    );
  }
}

export class MonthlyRepeat extends Repeat {
  readonly repeatType = "monthly";
  readonly frequency: number;
  readonly monthlyOnDay: number | null;

  constructor(frequency: number | null, monthlyOnDay: number | null) {
    super();
    this.frequency = frequency ?? 1;
    this.monthlyOnDay = monthlyOnDay;
  }

  getNextDate(dtstart: Date): Date | null {
    try {
      const rruleOptions: any = {
        freq: RRule.MONTHLY,
        interval: this.frequency,
        dtstart,
      };
      if (this.monthlyOnDay !== null) {
        rruleOptions.bymonthday = this.monthlyOnDay;
      }
      const rule = new RRule(rruleOptions);
      return rule.after(dtstart);
    } catch {
      return null;
    }
  }

  equals(other: Repeat): boolean {
    return (
      other instanceof MonthlyRepeat &&
      this.frequency === other.frequency &&
      this.monthlyOnDay === other.monthlyOnDay
    );
  }
}

export class YearlyRepeat extends Repeat {
  readonly repeatType = "yearly";
  readonly frequency: number;

  constructor(frequency: number | null) {
    super();
    this.frequency = frequency ?? 1;
  }

  getNextDate(dtstart: Date): Date | null {
    try {
      const rule = new RRule({
        freq: RRule.YEARLY,
        interval: this.frequency,
        dtstart,
      });
      return rule.after(dtstart);
    } catch {
      return null;
    }
  }

  equals(other: Repeat): boolean {
    return other instanceof YearlyRepeat && this.frequency === other.frequency;
  }
}

export function createRepeat(
  repeatType: string,
  frequency: number | null,
  weeklyOnDays: string | null,
  monthlyOnDay: number | null
): Repeat {
  switch (repeatType) {
    case "daily":
      return new DailyRepeat(frequency);
    case "weekly":
      return new WeeklyRepeat(frequency, weeklyOnDays);
    case "monthly":
      return new MonthlyRepeat(frequency, monthlyOnDay);
    case "yearly":
      return new YearlyRepeat(frequency);
    case "none":
    default:
      return new NoRepeat();
  }
}
