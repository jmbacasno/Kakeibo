import { NextFunction, Request, Response } from "express";
import { ValidationError } from "../../application/errors.js";

function parsePositiveInt(raw: string, label: string): number {
  const parsed = parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed <= 0 || parsed.toString() !== raw) {
    throw new ValidationError(`${label} must be a valid positive integer.`);
  }
  return parsed;
}

export function validateIdParam(req: Request, _res: Response, next: NextFunction): void {
  const idParam = req.params.id;
  if (idParam !== undefined) {
    parsePositiveInt(idParam, "Resource ID");
  }
  const categoryIdParam = req.params.categoryId;
  if (categoryIdParam !== undefined) {
    parsePositiveInt(categoryIdParam, "Category ID");
  }
  next();
}
