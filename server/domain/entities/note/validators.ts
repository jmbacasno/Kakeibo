import { EmptyNoteContentError } from "./errors.js";

export function validateNoteContent(content: string): void {
  if (!content || content.trim() === "") {
    throw new EmptyNoteContentError();
  }
}
