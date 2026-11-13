import { z, ZodError } from "zod";
import { ValidationError } from "./errors.js";

/**
 * Parses raw data against a Zod schema, throwing an application-level ValidationError if parsing/validation fails.
 * Automatically infers and returns the strongly-typed schema output.
 */
export function parseDTO<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  try {
    return schema.parse(data);
  } catch (err) {
    if (err instanceof ZodError) {
      throw new ValidationError("Input validation failed", err.issues.map(i => ({
        field: i.path.join("."),
        message: i.message
      })));
    }
    throw err;
  }
}

