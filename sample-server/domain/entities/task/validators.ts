import { CalendarDate } from "./valueObjects/calendarDate/index.js";
import {
  InvalidRepeatTypeError,
  InvalidRepeatFrequencyError,
  EmptyRepeatWeeklyOnDaysError,
  InvalidRepeatMonthlyOnDayError,
  InvalidRepeatEndsAtTypeError,
  InvalidRepeatEndsAtDateTypeError,
  EmptyRepeatEndsAtDateError,
  InvalidRepeatEndsAtDateFormatError,
  InvalidRepeatEndsAtCountError,
  EmptyTaskTitleError,
  TaskTitleTooLongError,
  InvalidTaskUserIdError,
  TaskNotesTooLongError,
  InvalidTaskIsCompletedTypeError,
  InvalidTaskDueDateTypeError,
  EmptyTaskDueDateError,
  InvalidTaskDueDateFormatError,
  InvalidTaskCompletedAtError,
  InvalidTaskCustomOrderError,
  InvalidTaskCategoryIdError,
} from "./errors.js";

// --- REPEAT RULE VALIDATORS ---

export function isRepeatTypeValid(repeatType: string): void {
  const validRepeatType = ["none", "daily", "weekly", "monthly", "yearly"];
  if (repeatType && !validRepeatType.includes(repeatType)) {
    throw new InvalidRepeatTypeError(repeatType);
  }
}

export function validateRepeatType(repeatType: string): void {
  isRepeatTypeValid(repeatType);
}

export function isRepeatFrequencyValid(repeatFrequency: number | null): void {
  if (repeatFrequency !== null && (isNaN(repeatFrequency) || repeatFrequency <= 0)) {
    throw new InvalidRepeatFrequencyError();
  }
}

export function validateRepeatFrequency(repeatFrequency: number | null): void {
  isRepeatFrequencyValid(repeatFrequency);
}

export function isRepeatWeeklyOnDaysNotEmpty(repeatWeeklyOnDays: string | null): void {
  if (repeatWeeklyOnDays !== null && repeatWeeklyOnDays.trim() === "") {
    throw new EmptyRepeatWeeklyOnDaysError();
  }
}

export function validateRepeatWeeklyOnDays(repeatWeeklyOnDays: string | null): void {
  isRepeatWeeklyOnDaysNotEmpty(repeatWeeklyOnDays);
}

export function isRepeatMonthlyOnDayValid(repeatMonthlyOnDay: number | null): void {
  if (repeatMonthlyOnDay !== null && repeatMonthlyOnDay !== -1 && (repeatMonthlyOnDay < 1 || repeatMonthlyOnDay > 31)) {
    throw new InvalidRepeatMonthlyOnDayError();
  }
}

export function validateRepeatMonthlyOnDay(repeatMonthlyOnDay: number | null): void {
  isRepeatMonthlyOnDayValid(repeatMonthlyOnDay);
}

export function isRepeatEndsAtTypeValid(repeatEndsAtType: string | null): void {
  if (repeatEndsAtType !== null) {
    const validEndsTypes = ["date", "count", "endlessly"];
    if (!validEndsTypes.includes(repeatEndsAtType)) {
      throw new InvalidRepeatEndsAtTypeError();
    }
  }
}

export function validateRepeatEndsAtType(repeatEndsAtType: string | null): void {
  isRepeatEndsAtTypeValid(repeatEndsAtType);
}

export function isRepeatEndsAtDateDateValidType(repeatEndsAtDateDate: string | null): void {
  if (repeatEndsAtDateDate !== null && typeof repeatEndsAtDateDate !== "string") {
    throw new InvalidRepeatEndsAtDateTypeError();
  }
}

export function isRepeatEndsAtDateDateNotEmpty(repeatEndsAtDateDate: string | null): void {
  if (repeatEndsAtDateDate !== null && repeatEndsAtDateDate.trim() === "") {
    throw new EmptyRepeatEndsAtDateError();
  }
}

export function isRepeatEndsAtDateDateFormatValid(repeatEndsAtDateDate: string | null): void {
  if (repeatEndsAtDateDate !== null) {
    const calendarDate = new CalendarDate(repeatEndsAtDateDate);
    if (!calendarDate.exists) {
      throw new InvalidRepeatEndsAtDateFormatError();
    }
  }
}

export function validateRepeatEndsAtDateDate(repeatEndsAtDateDate: string | null): void {
  isRepeatEndsAtDateDateValidType(repeatEndsAtDateDate);
  isRepeatEndsAtDateDateNotEmpty(repeatEndsAtDateDate);
  isRepeatEndsAtDateDateFormatValid(repeatEndsAtDateDate);
}

export function isRepeatEndsAtCountValid(repeatEndsAtCountCount: number | null): void {
  if (repeatEndsAtCountCount !== null && (isNaN(repeatEndsAtCountCount) || repeatEndsAtCountCount < 0)) {
    throw new InvalidRepeatEndsAtCountError();
  }
}

export function validateRepeatEndsAtCountCount(repeatEndsAtCountCount: number | null): void {
  isRepeatEndsAtCountValid(repeatEndsAtCountCount);
}

// --- TASK VALIDATORS ---

export function isTaskTitleNotEmpty(title: string): void {
  if (!title || title.trim() === "") {
    throw new EmptyTaskTitleError();
  }
}

export function isTaskTitleWithinLimit(title: string): void {
  if (title.length > 255) {
    throw new TaskTitleTooLongError();
  }
}

export function validateTitle(title: string): void {
  isTaskTitleNotEmpty(title);
  isTaskTitleWithinLimit(title);
}

export function isTaskUserIdValid(userId: number): void {
  if (userId <= 0) {
    throw new InvalidTaskUserIdError();
  }
}

export function validateUserId(userId: number): void {
  isTaskUserIdValid(userId);
}

export function isTaskNotesWithinLimit(notes: string | null): void {
  if (notes !== null && notes.length > 2000) {
    throw new TaskNotesTooLongError();
  }
}

export function validateNotes(notes: string | null): void {
  isTaskNotesWithinLimit(notes);
}

export function isTaskIsCompletedTypeValid(isCompleted: boolean): void {
  if (typeof isCompleted !== "boolean") {
    throw new InvalidTaskIsCompletedTypeError();
  }
}

export function validateIsCompleted(isCompleted: boolean): void {
  isTaskIsCompletedTypeValid(isCompleted);
}

export function isTaskDueDateTypeValid(dueDate: string | null): void {
  if (dueDate !== null && typeof dueDate !== "string") {
    throw new InvalidTaskDueDateTypeError();
  }
}

export function isTaskDueDateNotEmpty(dueDate: string | null): void {
  if (dueDate !== null && dueDate.trim() === "") {
    throw new EmptyTaskDueDateError();
  }
}

export function isTaskDueDateFormatValid(dueDate: string | null): void {
  if (dueDate !== null) {
    const calendarDate = new CalendarDate(dueDate);
    if (!calendarDate.exists) {
      throw new InvalidTaskDueDateFormatError();
    }
  }
}

export function validateDueDate(dueDate: string | null): void {
  isTaskDueDateTypeValid(dueDate);
  isTaskDueDateNotEmpty(dueDate);
  isTaskDueDateFormatValid(dueDate);
}

export function isTaskCompletedAtValid(completedAt: Date | null): void {
  if (completedAt !== null) {
    if (!(completedAt instanceof Date) || isNaN(completedAt.getTime())) {
      throw new InvalidTaskCompletedAtError();
    }
  }
}

export function validateCompletedAt(completedAt: Date | null): void {
  isTaskCompletedAtValid(completedAt);
}

export function isTaskCustomOrderValid(customOrder: number): void {
  if (typeof customOrder !== "number" || isNaN(customOrder)) {
    throw new InvalidTaskCustomOrderError();
  }
}

export function validateCustomOrder(customOrder: number): void {
  isTaskCustomOrderValid(customOrder);
}

export function isTaskCategoryIdValid(categoryId: number | null): void {
  if (categoryId !== null && categoryId <= 0) {
    throw new InvalidTaskCategoryIdError();
  }
}

export function validateCategoryId(categoryId: number | null): void {
  isTaskCategoryIdValid(categoryId);
}
