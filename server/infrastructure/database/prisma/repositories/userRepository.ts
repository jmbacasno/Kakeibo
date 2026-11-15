import { Prisma, PrismaClient } from "@prisma/client";
import { UserEntity } from "../../../../domain/entities/user/index.js";
import { UserRepositoryInterface } from "../../../../domain/repositories/userRepositoryInterface.js";
import { prisma } from "../client.js";
import { UserMapper } from "../mappers/userMapper.js";

type DbClient = PrismaClient | Prisma.TransactionClient;

export class UserRepository implements UserRepositoryInterface {
  constructor(private readonly client: DbClient = prisma) {}

  async findById(id: number): Promise<UserEntity | null> {
    const raw = await this.client.user.findUnique({ where: { id } });
    return raw ? UserMapper.toEntity(raw) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const normalized = email.trim().toLowerCase();
    const raw = await this.client.user.findUnique({ where: { email: normalized } });
    return raw ? UserMapper.toEntity(raw) : null;
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const created = await this.client.user.create({
      data: {
        name: user.name,
        email: user.email.trim().toLowerCase(),
        passwordHash: user.passwordHash,
      },
    });
    return UserMapper.toEntity(created);
  }
}
