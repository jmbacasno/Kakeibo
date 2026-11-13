import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../../application/errors.js";

/**
 * Middleware to check and validate that req.params.id is a positive integer.
 */
export function validateIdParam(req: Request, res: Response, next: NextFunction) {
  const idParam = req.params.id;
  if (idParam === undefined) {
    return next();
  }

  const parsed = parseInt(idParam, 10);
  if (isNaN(parsed) || parsed <= 0 || parsed.toString() !== idParam) {
    throw new ValidationError("The resource ID must be a valid positive integer.");
  }

  next();
}

/**
 * Middleware to ensure body has optional or required fields, dry-vibe.
 */
export function validateBodyNonEmpty(req: Request, res: Response, next: NextFunction) {
  if (!req.body || typeof req.body !== "object" || Object.keys(req.body).length === 0) {
    throw new ValidationError("Request body cannot be empty and must be a valid JSON object.");
  }
  next();
}
