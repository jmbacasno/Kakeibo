import { z, ZodError } from "zod";
import { ValidationError } from "./errors.js";

export function parseDTO<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  try {
    return schema.parse(data);
  } catch (err) {
    if (err instanceof ZodError) {
      const formatted = err.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      throw new ValidationError(formatted[0]?.message || "Input validation failed", formatted);
    }
    throw err;
  }
}
