import { DomainError } from "../../errors.js";

export class EmptyNoteContentError extends DomainError {
  constructor() {
    super("Note content is required", "EMPTY_NOTE_CONTENT");
    this.name = "EmptyNoteContentError";
  }
}
