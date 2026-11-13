import { z } from "zod";
import { UserEntity } from "../../domain/entities/user/index.js";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name is too long"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email or username is required").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInputDTO = z.infer<typeof registerSchema>;
export type LoginInputDTO = z.infer<typeof loginSchema>;

export class AuthDTO {
  id!: number;
  name!: string;
  email!: string;
  createdAt!: string | null;
  updatedAt!: string | null;

  static fromEntity(user: UserEntity): AuthDTO {
    return {
      id: user.id!,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt ? user.createdAt.toISOString() : null,
      updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null,
    };
  }
}
