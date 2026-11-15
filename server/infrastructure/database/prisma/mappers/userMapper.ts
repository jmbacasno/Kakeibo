import { User as PrismaUser } from "@prisma/client";
import { User } from "../../../../domain/entities/user/index.js";

export class UserMapper {
  static toEntity(raw: PrismaUser): User {
    return new User({
      id: raw.id,
      name: raw.name,
      email: raw.email,
      passwordHash: raw.passwordHash,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
