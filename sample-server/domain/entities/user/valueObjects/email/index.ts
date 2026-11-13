import { validateEmail } from "../../validators.js";

/**
 * Email Value Object representing a validated, immutable user email address.
 */
export class Email {
  private readonly _value: string;

  constructor(value: string) {
    validateEmail(value);
    this._value = value;
  }

  /**
   * Returns the raw string value of the email address.
   */
  get value(): string {
    return this._value;
  }

  /**
   * Checks equality with another Email Value Object (case-insensitive).
   */
  equals(other: Email): boolean {
    return this._value.toLowerCase() === other.value.toLowerCase();
  }
}
