import { DomainError } from "../../errors.js";

export class EmptyReflectionContentError extends DomainError {
  constructor() {
    super("Reflection content cannot be empty", "EMPTY_REFLECTION_CONTENT");
    this.name = "EmptyReflectionContentError";
  }
}
