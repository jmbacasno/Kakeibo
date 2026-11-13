import { UserEntity } from "../../domain/entities/user/index.js";
import { z } from "zod";
import { ValidationError } from "../errors.js";

export const registerSchema = z.object({
  email: z.string().email("Please provide a valid email format."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
  name: z.string().min(3, "Username must be at least 3 characters long.").optional(),
});

export const loginSchema = z.object({
  email: z.string().min(1, "Email or username is required."),
  password: z.string().min(1, "Password is required."),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name cannot be empty.").nullable().optional(),
  email: z.string().email("Please provide a valid email format.").optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "New password must be at least 6 characters long.").or(z.literal("")).optional(),
  phone: z.string().optional(),
  gender: z.string().optional(),
  location: z.string().optional(),
});

export type RegisterInputDTO = z.infer<typeof registerSchema>;
export type LoginInputDTO = z.infer<typeof loginSchema>;
export type UpdateProfileInputDTO = z.infer<typeof updateProfileSchema>;


export class AuthDTO {
  id!: number;
  email!: string;
  name!: string | null;
  phone?: string;
  gender?: string;
  location?: string;

  static fromEntity(user: UserEntity): AuthDTO {
    if (!user) {
      throw new ValidationError("User entity is null or undefined.");
    }
    if (typeof user.id !== "number" || isNaN(user.id) || user.id <= 0) {
      throw new ValidationError(
        "Database persistence validation failed for User: id must be a valid positive number."
      );
    }
    if (!user.createdAt || !(user.createdAt instanceof Date) || isNaN(user.createdAt.getTime())) {
      throw new ValidationError(
        "Database persistence validation failed for User: createdAt must be a valid Date object."
      );
    }
    if (!user.updatedAt || !(user.updatedAt instanceof Date) || isNaN(user.updatedAt.getTime())) {
      throw new ValidationError(
        "Database persistence validation failed for User: updatedAt must be a valid Date object."
      );
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: (user as any).phone,
      gender: (user as any).gender,
      location: (user as any).location,
    };
  }
}

export class UserProfileDTO {
  id!: number;
  email!: string;
  name!: string | null;
  phone?: string;
  gender?: string;
  location?: string;

  static fromEntity(user: UserEntity): UserProfileDTO {
    if (!user) {
      throw new ValidationError("User entity is null or undefined.");
    }
    if (typeof user.id !== "number" || isNaN(user.id) || user.id <= 0) {
      throw new ValidationError(
        "Database persistence validation failed for User: id must be a valid positive number."
      );
    }
    if (!user.createdAt || !(user.createdAt instanceof Date) || isNaN(user.createdAt.getTime())) {
      throw new ValidationError(
        "Database persistence validation failed for User: createdAt must be a valid Date object."
      );
    }
    if (!user.updatedAt || !(user.updatedAt instanceof Date) || isNaN(user.updatedAt.getTime())) {
      throw new ValidationError(
        "Database persistence validation failed for User: updatedAt must be a valid Date object."
      );
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: (user as any).phone,
      gender: (user as any).gender,
      location: (user as any).location,
    };
  }
}
