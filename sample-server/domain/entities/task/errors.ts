import { DomainError } from "../../errors.js";

// --- REPEAT RULE ERRORS ---

export class InvalidRepeatTypeError extends DomainError {
  constructor(repeatType: string) {
    super(`Invalid repeatType value: ${repeatType}`, "INVALID_REPEAT_TYPE");
    this.name = "InvalidRepeatTypeError";
  }
}

export class InvalidRepeatFrequencyError extends DomainError {
  constructor() {
    super("Repeat frequency must be a positive number", "INVALID_REPEAT_FREQUENCY");
    this.name = "InvalidRepeatFrequencyError";
  }
}

export class EmptyRepeatWeeklyOnDaysError extends DomainError {
  constructor() {
    super("repeatWeeklyOnDays cannot be empty if provided", "EMPTY_REPEAT_WEEKLY_ON_DAYS");
    this.name = "EmptyRepeatWeeklyOnDaysError";
  }
}

export class InvalidRepeatMonthlyOnDayError extends DomainError {
  constructor() {
    super("repeatMonthlyOnDay must be -1 or between 1 and 31", "INVALID_REPEAT_MONTH_DAY");
    this.name = "InvalidRepeatMonthlyOnDayError";
  }
}

export class InvalidRepeatEndsAtTypeError extends DomainError {
  constructor() {
    super("Invalid repeat ends-at type", "INVALID_REPEAT_ENDS_AT_TYPE");
    this.name = "InvalidRepeatEndsAtTypeError";
  }
}

export class InvalidRepeatEndsAtDateTypeError extends DomainError {
  constructor() {
    super("Repeat ends at date must be a string", "INVALID_REPEAT_ENDS_AT_DATE_TYPE");
    this.name = "InvalidRepeatEndsAtDateTypeError";
  }
}

export class EmptyRepeatEndsAtDateError extends DomainError {
  constructor() {
    super("Repeat ends at date cannot be empty if provided", "EMPTY_REPEAT_ENDS_AT_DATE");
    this.name = "EmptyRepeatEndsAtDateError";
  }
}

export class InvalidRepeatEndsAtDateFormatError extends DomainError {
  constructor() {
    super("Repeat ends at date must be a valid date string", "INVALID_REPEAT_ENDS_AT_DATE_FORMAT");
    this.name = "InvalidRepeatEndsAtDateFormatError";
  }
}

export class InvalidRepeatEndsAtCountError extends DomainError {
  constructor() {
    super("Repeat count must be a non-negative number", "INVALID_REPEAT_ENDS_AT_COUNT");
    this.name = "InvalidRepeatEndsAtCountError";
  }
}

export class MissingRepeatEndsAtDateError extends DomainError {
  constructor() {
    super("A repeat ends-at date must be provided when ends-at type is 'date'", "MISSING_REPEAT_ENDS_AT_DATE");
    this.name = "MissingRepeatEndsAtDateError";
  }
}

export class MissingRepeatEndsAtCountError extends DomainError {
  constructor() {
    super("A repeat count must be provided when ends-at type is 'count'", "MISSING_REPEAT_ENDS_AT_COUNT");
    this.name = "MissingRepeatEndsAtCountError";
  }
}

export class RepeatDaysForDailyIntervalError extends DomainError {
  constructor() {
    super("Repeat days cannot be specified for a daily interval", "REPEAT_DAYS_DAILY_INTERVAL");
    this.name = "RepeatDaysForDailyIntervalError";
  }
}

export class RepeatMonthDayForDailyIntervalError extends DomainError {
  constructor() {
    super("Repeat month day cannot be specified for a daily interval", "REPEAT_MONTH_DAY_DAILY_INTERVAL");
    this.name = "RepeatMonthDayForDailyIntervalError";
  }
}

export class RepeatMonthDayForWeeklyIntervalError extends DomainError {
  constructor() {
    super("Repeat month day cannot be specified for a weekly interval", "REPEAT_MONTH_DAY_WEEKLY_INTERVAL");
    this.name = "RepeatMonthDayForWeeklyIntervalError";
  }
}

// --- TASK ERRORS ---

export class EmptyTaskTitleError extends DomainError {
  constructor() {
    super("Task title cannot be empty", "EMPTY_TASK_TITLE");
    this.name = "EmptyTaskTitleError";
  }
}

export class TaskTitleTooLongError extends DomainError {
  constructor() {
    super("Task title cannot exceed 100 characters", "TASK_TITLE_TOO_LONG");
    this.name = "TaskTitleTooLongError";
  }
}

export class InvalidTaskUserIdError extends DomainError {
  constructor() {
    super("User ID must be valid", "INVALID_TASK_USER_ID");
    this.name = "InvalidTaskUserIdError";
  }
}

export class TaskNotesTooLongError extends DomainError {
  constructor() {
    super("Notes cannot exceed 2000 characters", "TASK_NOTES_TOO_LONG");
    this.name = "TaskNotesTooLongError";
  }
}

export class InvalidTaskIsCompletedTypeError extends DomainError {
  constructor() {
    super("isCompleted must be a boolean", "INVALID_TASK_IS_COMPLETED_TYPE");
    this.name = "InvalidTaskIsCompletedTypeError";
  }
}

export class InvalidTaskDueDateTypeError extends DomainError {
  constructor() {
    super("Due date must be a string", "INVALID_TASK_DUE_DATE_TYPE");
    this.name = "InvalidTaskDueDateTypeError";
  }
}

export class EmptyTaskDueDateError extends DomainError {
  constructor() {
    super("Due date cannot be empty if provided", "EMPTY_TASK_DUE_DATE");
    this.name = "EmptyTaskDueDateError";
  }
}

export class InvalidTaskDueDateFormatError extends DomainError {
  constructor() {
    super("Due date must be a valid date string", "INVALID_TASK_DUE_DATE_FORMAT");
    this.name = "InvalidTaskDueDateFormatError";
  }
}

export class InvalidTaskCompletedAtError extends DomainError {
  constructor() {
    super("Completed at must be a valid Date object", "INVALID_TASK_COMPLETED_AT");
    this.name = "InvalidTaskCompletedAtError";
  }
}

export class InvalidTaskCustomOrderError extends DomainError {
  constructor() {
    super("Custom order must be a valid number", "INVALID_TASK_CUSTOM_ORDER");
    this.name = "InvalidTaskCustomOrderError";
  }
}

export class InvalidTaskCategoryIdError extends DomainError {
  constructor() {
    super("Category ID must be positive and non-zero", "INVALID_TASK_CATEGORY_ID");
    this.name = "InvalidTaskCategoryIdError";
  }
}

export class RepeatRuleRequiresDueDateError extends DomainError {
  constructor() {
    super("A task must have a due date if a recurring repeat rule is specified", "REPEAT_RULE_REQUIRES_DUE_DATE");
    this.name = "RepeatRuleRequiresDueDateError";
  }
}
