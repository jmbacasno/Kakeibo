export class ApplicationError extends Error {
  constructor(
    message: string,
    public code: string = "APPLICATION_ERROR",
    public details: unknown = null
  ) {
    super(message);
    this.name = "ApplicationError";
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string, details: unknown = null) {
    super(message, "VALIDATION_FAILED", details);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends ApplicationError {
  constructor(
    message: string = "Authentication required. Please sign in.",
    details: unknown = null
  ) {
    super(message, "AUTHENTICATION_FAILED", details);
    this.name = "AuthenticationError";
  }
}

export class UnauthorizedError extends AuthenticationError {
  constructor(
    message: string = "Authentication required. Please sign in.",
    details: unknown = null
  ) {
    super(message, details);
    this.code = "UNAUTHORIZED_ACCESS";
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(message: string = "You do not have permission to access this resource.", details: unknown = null) {
    super(message, "FORBIDDEN", details);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message: string, details: unknown = null) {
    super(message, "NOT_FOUND", details);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends ApplicationError {
  constructor(message: string, details: unknown = null) {
    super(message, "CONFLICT", details);
    this.name = "ConflictError";
  }
}

export class InternalServerError extends ApplicationError {
  constructor(message: string, details: unknown = null) {
    super(message, "INTERNAL_SERVER_ERROR", details);
    this.name = "InternalServerError";
  }
}
