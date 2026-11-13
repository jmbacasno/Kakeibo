import { Request, Response, NextFunction } from "express";
import { logger } from "../dependencies.js";
import { ApplicationError } from "../../application/errors.js";
import { DomainError } from "../../domain/errors.js";
import { Prisma } from "@prisma/client";

export const ErrorCodeToStatus: Record<string, number> = {
  APPLICATION_ERROR: 400,
  VALIDATION_FAILED: 400,
  AUTHENTICATION_FAILED: 401,
  UNAUTHORIZED_ACCESS: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  DOMAIN_ERROR: 400,
  ENTITY_NOT_FOUND: 404,
  INFRASTRUCTURE_ERROR: 500,
  DATABASE_ERROR: 500,
  CONFIGURATION_ERROR: 500,
  SECURITY_ERROR: 500
};

interface ExtractedErrorResponse {
  statusCode: number;
  code: string;
  message: string;
  details: any;
}

interface ErrorHandlerStrategy {
  canHandle(err: any): boolean;
  handle(err: any): ExtractedErrorResponse;
}

/**
 * Strategy for standard database errors (Prisma Client errors).
 * Masks detailed system exceptions securely behind a generic DATABASE_ERROR signature.
 */
const prismaErrorStrategy: ErrorHandlerStrategy = {
  canHandle: (err) =>
    err &&
    (err instanceof Prisma.PrismaClientKnownRequestError ||
      err instanceof Prisma.PrismaClientUnknownRequestError ||
      err instanceof Prisma.PrismaClientRustPanicError ||
      err instanceof Prisma.PrismaClientInitializationError ||
      err instanceof Prisma.PrismaClientValidationError ||
      err.constructor?.name?.startsWith("PrismaClient") ||
      err.name?.startsWith("PrismaClient")),
  handle: (): ExtractedErrorResponse => ({
    statusCode: 500,
    code: "DATABASE_ERROR",
    message: "A database error occurred",
    details: null,
  }),
};

/**
 * Strategy for custom operational application errors.
 */
const applicationErrorStrategy: ErrorHandlerStrategy = {
  canHandle: (err) => err instanceof ApplicationError,
  handle: (err: ApplicationError): ExtractedErrorResponse => {
    const code = err.code || "APPLICATION_ERROR";
    return {
      statusCode: ErrorCodeToStatus[code] || 400,
      code,
      message: err.message,
      details: err.details || null,
    };
  },
};

/**
 * Strategy for domain business rule errors.
 */
const domainErrorStrategy: ErrorHandlerStrategy = {
  canHandle: (err) => err instanceof DomainError,
  handle: (err: DomainError): ExtractedErrorResponse => {
    const code = err.code || "DOMAIN_ERROR";
    return {
      statusCode: ErrorCodeToStatus[code] || 400,
      code,
      message: err.message,
      details: err.details || null,
    };
  },
};

/**
 * Fallback strategy for general runtime/system errors.
 * Masks sensitive raw details to prevent system information leakage.
 */
const defaultErrorStrategy: ErrorHandlerStrategy = {
  canHandle: () => true,
  handle: (): ExtractedErrorResponse => ({
    statusCode: 500,
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
    details: null,
  }),
};

/**
 * Ordered list of handlers where the first matching strategy takes precedence.
 */
const errorStrategies: ErrorHandlerStrategy[] = [
  prismaErrorStrategy,
  applicationErrorStrategy,
  domainErrorStrategy,
  defaultErrorStrategy,
];

/**
 * Master express middleware for unified global exception intercepting.
 */
export function globalErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Always log raw details server-side for system tracing/auditing
  logger.error("Unhandled Presentation-tier error caught inside global handler:", err);

  const strategy = errorStrategies.find(s => s.canHandle(err)) || defaultErrorStrategy;
  const { statusCode, code, message, details } = strategy.handle(err);

  res.status(statusCode).json({
    code,
    error: message,
    details,
  });
}
