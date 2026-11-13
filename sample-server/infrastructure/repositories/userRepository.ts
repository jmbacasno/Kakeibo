import { UserRepositoryInterface } from "../../domain/repositories/userRepositoryInterface.js";
import { UserEntity } from "../../domain/entities/user/index.js";
import { prisma } from "../persistence/clients/prisma.js";
import { UserModel } from "../persistence/models/userModel.js";

export class UserRepository implements UserRepositoryInterface {
  constructor(private client = prisma) {}

  async findById(id: number): Promise<UserEntity | null> {
    const user = await this.client.user.findUnique({ where: { id } });
    if (!user) return null;
    return UserModel.toEntity(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.client.user.findUnique({ where: { email } });
    if (!user) return null;
    return UserModel.toEntity(user);
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const created = await this.client.user.create({
      data: {
        email: user.email,
        password: user.password || "",
        name: user.name,
      }
    });
    return UserModel.toEntity(created);
  }

  async update(user: UserEntity): Promise<UserEntity> {
    const updated = await this.client.user.update({
      where: { id: user.id },
      data: {
        email: user.email,
        name: user.name,
        password: user.password,
      }
    });
    return UserModel.toEntity(updated);
  }

  async delete(id: number): Promise<void> {
    await this.client.user.delete({
      where: { id }
    });
  }
}
