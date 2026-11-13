export class DomainError extends Error {
  public code: string;
  public details: unknown;

  constructor(message: string, code: string = "DOMAIN_ERROR", details: unknown = null) {
    super(message);
    this.name = "DomainError";
    this.code = code;
    this.details = details;
  }
}

export class EntityNotFoundError extends DomainError {
  constructor(entity: string, details: unknown = null) {
    super(`${entity} not found`, "ENTITY_NOT_FOUND", details);
    this.name = "EntityNotFoundError";
  }
}
