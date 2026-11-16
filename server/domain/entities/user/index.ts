import {
  validateFirstName,
  validateLastName,
  validateUserEmail,
  validateUserPassword,
} from "./validators.js";

export interface UserEntity {
  id: number | null;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  lastLoginAt: Date | null;
  loginCount: number;
  failLoginCount: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class User implements UserEntity {
  id: number | null;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  lastLoginAt: Date | null;
  loginCount: number;
  failLoginCount: number;
  createdAt: Date | null;
  updatedAt: Date | null;

  constructor(data: UserEntity) {
    this.id = data.id;
    this.firstName = data.firstName.trim();
    this.lastName = data.lastName.trim();
    this.email = data.email.trim().toLowerCase();
    this.password = data.password;
    this.lastLoginAt = data.lastLoginAt;
    this.loginCount = data.loginCount;
    this.failLoginCount = data.failLoginCount;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;

    this.validate();
  }

  validate(): void {
    validateFirstName(this.firstName);
    validateLastName(this.lastName);
    validateUserEmail(this.email);
    validateUserPassword(this.password);
  }
}
