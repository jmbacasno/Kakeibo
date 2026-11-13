export class DomainError extends Error {
  public code: string;
  public details: any;
  constructor(message: string, code: string = "DOMAIN_ERROR", details: any = null) {
    super(message);
    this.name = "DomainError";
    this.code = code;
    this.details = details;
  }
}

export class EntityNotFoundError extends DomainError {
  constructor(entity: string, details: any = null) {
    super(`${entity} not found`, "ENTITY_NOT_FOUND", details);
    this.name = "EntityNotFoundError";
  }
}
