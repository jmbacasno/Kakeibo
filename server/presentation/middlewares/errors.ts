import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { ApplicationError } from "../../application/errors.js";
import { DomainError } from "../../domain/errors.js";
import { logger } from "../dependencies.js";

export const ErrorCodeToStatus: Record<string, number> = {
  APPLICATION_ERROR: 400,
  VALIDATION_FAILED: 400,
  AUTHENTICATION_FAILED: 401,
  UNAUTHORIZED_ACCESS: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  DOMAIN_ERROR: 400,
  ENTITY_NOT_FOUND: 404,
  INFRASTRUCTURE_ERROR: 500,
  DATABASE_ERROR: 500,
  CONFIGURATION_ERROR: 500,
  SECURITY_ERROR: 500,
};

interface ExtractedErrorResponse {
  statusCode: number;
  code: string;
  message: string;
  details: unknown;
}

interface ErrorHandlerStrategy {
  canHandle(err: unknown): boolean;
  handle(err: unknown): ExtractedErrorResponse;
}

const prismaErrorStrategy: ErrorHandlerStrategy = {
  canHandle: (err) => {
    if (!err || typeof err !== "object") return false;
    const e = err as { name?: string; constructor?: { name?: string } };
    return (
      err instanceof Prisma.PrismaClientKnownRequestError ||
      err instanceof Prisma.PrismaClientUnknownRequestError ||
      err instanceof Prisma.PrismaClientRustPanicError ||
      err instanceof Prisma.PrismaClientInitializationError ||
      err instanceof Prisma.PrismaClientValidationError ||
      Boolean(e.constructor?.name?.startsWith("PrismaClient")) ||
      Boolean(e.name?.startsWith("PrismaClient"))
    );
  },
  handle: (err): ExtractedErrorResponse => {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return {
          statusCode: 409,
          code: "CONFLICT",
          message: "A record with this value already exists.",
          details: null,
        };
      }
      if (err.code === "P2003") {
        return {
          statusCode: 400,
          code: "VALIDATION_FAILED",
          message: "Invalid reference to a related record.",
          details: null,
        };
      }
      if (err.code === "P2025") {
        return {
          statusCode: 404,
          code: "NOT_FOUND",
          message: "Requested record was not found.",
          details: null,
        };
      }
    }
    return {
      statusCode: 500,
      code: "DATABASE_ERROR",
      message: "A database error occurred.",
      details: null,
    };
  },
};

const applicationErrorStrategy: ErrorHandlerStrategy = {
  canHandle: (err) => err instanceof ApplicationError,
  handle: (err): ExtractedErrorResponse => {
    const appErr = err as ApplicationError;
    const code = appErr.code || "APPLICATION_ERROR";
    return {
      statusCode: ErrorCodeToStatus[code] || 400,
      code,
      message: appErr.message,
      details: appErr.details || null,
    };
  },
};

const domainErrorStrategy: ErrorHandlerStrategy = {
  canHandle: (err) => err instanceof DomainError,
  handle: (err): ExtractedErrorResponse => {
    const domainErr = err as DomainError;
    const code = domainErr.code || "DOMAIN_ERROR";
    return {
      statusCode: ErrorCodeToStatus[code] || 400,
      code,
      message: domainErr.message,
      details: domainErr.details || null,
    };
  },
};

const defaultErrorStrategy: ErrorHandlerStrategy = {
  canHandle: () => true,
  handle: (): ExtractedErrorResponse => ({
    statusCode: 500,
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred.",
    details: null,
  }),
};

const errorStrategies: ErrorHandlerStrategy[] = [
  prismaErrorStrategy,
  applicationErrorStrategy,
  domainErrorStrategy,
  defaultErrorStrategy,
];

export function globalErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const strategy = errorStrategies.find((s) => s.canHandle(err)) || defaultErrorStrategy;
  const { statusCode, code, message, details } = strategy.handle(err);

  if (statusCode >= 500) {
    logger.error("Unhandled server error:", err);
  } else {
    logger.warn(`Request error [${code}]: ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    code,
    message,
    error: message,
    details,
  });
}
