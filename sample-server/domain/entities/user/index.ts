import { Email } from "./valueObjects/email/index.js";
import { validateName, validatePassword } from "./validators.js";

export { Email };

export interface UserEntity {
  // --- Fields ---

  /** The unique email address used as the user login credential */
  email: string;

  /** The human-readable name of the user, nullable if not specified */
  name: string | null;

  /** The secure, hashed password string (optional on some DTO transforms) */
  password?: string;

  /** Unique auto-incrementing database identifier, null for unsaved models */
  id: number | null;

  phone?: string;
  gender?: string;
  location?: string;

  /** Audit log timestamp indicating when the user record was first persisted */
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class User implements UserEntity {
  // --- Private Encapsulated Value Objects ---
  private _email: Email;
  
  // --- Primitive/Standard Fields ---
  private _name: string | null;
  private _password?: string;

  id: number | null;
  phone?: string;
  gender?: string;
  location?: string;

  /** Audit log timestamp indicating when the user record was first persisted */
  createdAt: Date | null;

  /** Audit log timestamp indicating when the user record was last modified */
  updatedAt: Date | null;

  constructor(data: UserEntity) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;

    // Encapsulate raw values into domain Value Object and standard validated fields
    this._email = new Email(data.email);
    
    validateName(data.name);
    this._name = data.name;

    if (data.password !== undefined) {
      validatePassword(data.password);
      this._password = data.password;
    }
  }

  // --- Getters & Setters exposing primitives safely with direct validation ---

  get email(): string {
    return this._email.value;
  }

  set email(value: string) {
    this._email = new Email(value);
  }

  get name(): string | null {
    return this._name;
  }

  set name(value: string | null) {
    validateName(value);
    this._name = value;
  }

  get password(): string | undefined {
    return this._password;
  }

  set password(value: string | undefined) {
    if (value !== undefined) {
      validatePassword(value);
      this._password = value;
    } else {
      this._password = undefined;
    }
  }

  static validateEmail(email: string): void {
    new Email(email);
  }

  static validateName(name: string | null): void {
    validateName(name);
  }

  static validatePassword(password?: string): void {
    validatePassword(password);
  }

  validateEmail(email: string): void {
    new Email(email);
  }

  validateName(name: string | null): void {
    validateName(name);
  }

  validatePassword(password?: string): void {
    validatePassword(password);
  }

  validate(): void {
    // Verified by constructor and property setters
  }

  update(data: Partial<Omit<UserEntity, "id" | "createdAt" | "updatedAt">>): this {
    if (data.email !== undefined) {
      this._email = new Email(data.email);
    }
    if (data.name !== undefined) {
      validateName(data.name);
      this._name = data.name;
    }
    if (data.password !== undefined) {
      validatePassword(data.password);
      this._password = data.password;
    }
    this.updatedAt = new Date();
    return this;
  }
}
