import { ZodError } from 'zod';
import { AppError } from '../utils/errors.js';

export function validateBody(schema) {
  return (req, _res, next) => {
    try {
      req.validatedBody = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const formatted = err.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        return next(new AppError(formatted[0]?.message || 'Validation failed', 400, formatted));
      }
      next(err);
    }
  };
}

export function validateQuery(schema) {
  return (req, _res, next) => {
    try {
      req.validatedQuery = schema.parse(req.query);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const formatted = err.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        return next(new AppError(formatted[0]?.message || 'Invalid query parameters', 400, formatted));
      }
      next(err);
    }
  };
}
