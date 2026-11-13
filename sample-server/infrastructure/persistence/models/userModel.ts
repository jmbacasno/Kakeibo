import { User as PrismaUser } from "@prisma/client";
import { User } from "../../../domain/entities/user/index.js";

export class UserModel {
  static toEntity(raw: PrismaUser): User {
    return new User({
      id: raw.id,
      email: raw.email,
      name: raw.name,
      password: raw.password || undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
