import bcryptjs from "bcryptjs";
import { PasswordHasherInterface } from "../../domain/services/passwordHasherInterface.js";

export class PasswordHasher implements PasswordHasherInterface {
  private readonly saltRounds: number;

  constructor(saltRounds: number = 10) {
    this.saltRounds = saltRounds;
  }

  async hash(password: string): Promise<string> {
    return bcryptjs.hash(password, this.saltRounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcryptjs.compare(password, hash);
  }
}
