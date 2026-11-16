import { User as PrismaUser } from "@prisma/client";
import { User } from "../../../../domain/entities/user/index.js";

export class UserMapper {
  static toEntity(raw: PrismaUser): User {
    return new User({
      id: raw.id,
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email,
      password: raw.password,
      lastLoginAt: raw.lastLoginAt,
      loginCount: raw.loginCount,
      failLoginCount: raw.failLoginCount,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
