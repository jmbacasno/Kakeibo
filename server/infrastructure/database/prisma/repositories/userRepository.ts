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
        firstName: user.firstName.trim(),
        lastName: user.lastName.trim(),
        email: user.email.trim().toLowerCase(),
        password: user.password,
        lastLoginAt: user.lastLoginAt,
        loginCount: user.loginCount,
        failLoginCount: user.failLoginCount,
      },
    });
    return UserMapper.toEntity(created);
  }

  async update(user: UserEntity): Promise<UserEntity> {
    const updated = await this.client.user.update({
      where: { id: user.id! },
      data: {
        firstName: user.firstName.trim(),
        lastName: user.lastName.trim(),
        email: user.email.trim().toLowerCase(),
        password: user.password,
        lastLoginAt: user.lastLoginAt,
        loginCount: user.loginCount,
        failLoginCount: user.failLoginCount,
      },
    });
    return UserMapper.toEntity(updated);
  }

  async recordSuccessfulLogin(id: number, loggedInAt: Date): Promise<UserEntity> {
    const updated = await this.client.user.update({
      where: { id },
      data: {
        lastLoginAt: loggedInAt,
        loginCount: { increment: 1 },
        failLoginCount: 0,
      },
    });
    return UserMapper.toEntity(updated);
  }

  async recordFailedLogin(id: number): Promise<void> {
    await this.client.user.update({
      where: { id },
      data: {
        failLoginCount: { increment: 1 },
      },
    });
  }
}
