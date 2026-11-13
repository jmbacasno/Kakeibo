export class ApplicationError extends Error {
  constructor(
    message: string,
    public code: string = "APPLICATION_ERROR",
    public details: any = null
  ) {
    super(message);
    this.name = "ApplicationError";
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string, details: any = null) {
    super(message, "VALIDATION_FAILED", details);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends ApplicationError {
  constructor(message: string = "Unauthorized access, please login first", details: any = null) {
    super(message, "AUTHENTICATION_FAILED", details);
    this.name = "AuthenticationError";
  }
}

export class UnauthorizedError extends AuthenticationError {
  constructor(message: string = "Unauthorized access, please login first", details: any = null) {
    super(message, details);
    this.code = "UNAUTHORIZED_ACCESS";
    this.name = "UnauthorizedError";
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message: string, details: any = null) {
    super(message, "NOT_FOUND", details);
    this.name = "NotFoundError";
  }
}

export class InternalServerError extends ApplicationError {
  constructor(message: string, details: any = null) {
    super(message, "INTERNAL_SERVER_ERROR", details);
    this.name = "InternalServerError";
  }
}
