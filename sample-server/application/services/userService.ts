import { UnitOfWorkInterface } from "../../domain/repositories/unitOfWorkInterface.js";
import { UserProfileDTO, UpdateProfileInputDTO, updateProfileSchema } from "../dtos/userDTO.js";
import { parseDTO } from "../validation.js";
import { User } from "../../domain/entities/user/index.js";
import { NotFoundError, ValidationError } from "../errors.js";
import { PasswordHasherInterface } from "../../domain/services/passwordHasherInterface.js";

export class UserService {
  constructor(
    private uow: UnitOfWorkInterface,
    private passwordHasher?: PasswordHasherInterface
  ) {}

  async getProfile(userId: number): Promise<UserProfileDTO> {
    const user = await this.uow.users.findById(userId);
    if (!user) {
      throw new NotFoundError("User profile not found");
    }
    return UserProfileDTO.fromEntity(user);
  }

  async updateProfile(userId: number, rawData: unknown): Promise<UserProfileDTO> {
    const data = parseDTO(updateProfileSchema, rawData);
    return this.uow.runInTransaction(async (tx) => {
      const userEntity = await tx.users.findById(userId);
      if (!userEntity) {
        throw new NotFoundError("User profile not found");
      }

      if (data.email && data.email !== userEntity.email) {
        const existing = await tx.users.findByEmail(data.email);
        if (existing) {
          throw new ValidationError("Email is already in use by another account");
        }
      }

      const user = new User(userEntity);
      user.update({
        name: data.name !== undefined ? data.name : undefined,
        email: data.email !== undefined ? data.email : undefined,
      });

      if (data.newPassword) {
        if (!data.currentPassword) {
          throw new ValidationError("Current password is required to change password");
        }
        if (!this.passwordHasher) {
          throw new Error("Password hasher is not available in user service");
        }
        const isMatch = await this.passwordHasher.compare(data.currentPassword, userEntity.password || "");
        if (!isMatch) {
          throw new ValidationError("Current password is incorrect");
        }
        const hashedPassword = await this.passwordHasher.hash(data.newPassword);
        user.update({
          password: hashedPassword
        });
      }

      const updated = await tx.users.update(user);
      return UserProfileDTO.fromEntity(updated);
    });
  }

  async deleteAccount(userId: number): Promise<void> {
    await this.uow.runInTransaction(async (tx) => {
      const user = await tx.users.findById(userId);
      if (!user) {
        throw new NotFoundError("User profile not found");
      }
      await tx.users.delete(userId);
    });
  }

  async resetWorkspaceData(userId: number): Promise<void> {
    await this.uow.runInTransaction(async (tx) => {
      // Find all tasks/notes for this user and delete them
      const tasks = await tx.tasks.findAllByUserId(userId);
      for (const t of tasks) {
        await tx.tasks.delete(t.id);
      }

      // Find all categories for this user and delete them
      const categories = await tx.categories.findAllByUserId(userId);
      for (const c of categories) {
        await tx.categories.delete(c.id);
      }
    });
  }
}
