import { validatePasswordHash, validateUserEmail, validateUserName } from "./validators.js";

export interface UserEntity {
  id: number | null;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class User implements UserEntity {
  id: number | null;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date | null;
  updatedAt: Date | null;

  constructor(data: UserEntity) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.passwordHash = data.passwordHash;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;

    this.validate();
  }

  validate(): void {
    validateUserName(this.name);
    validateUserEmail(this.email);
    validatePasswordHash(this.passwordHash);
  }
}
