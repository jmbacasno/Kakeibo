import { EmptyReflectionContentError } from "./errors.js";

export function validateReflectionContent(content: string): void {
  if (!content || content.trim() === "") {
    throw new EmptyReflectionContentError();
  }
}
