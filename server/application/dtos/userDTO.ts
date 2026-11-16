import { z } from "zod";
import { UserEntity } from "../../domain/entities/user/index.js";

const emailValidator = z.string().email("Please enter a valid email address");

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "First name is required")
      .max(50, "First name is too long"),
    lastName: z
      .string()
      .trim()
      .min(1, "Last name is required")
      .max(50, "Last name is too long"),
    email: z
      .string()
      .trim()
      .email("Please enter a valid email address")
      .toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long"),
    repeatPassword: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords do not match",
    path: ["repeatPassword"],
  });

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email or username is required").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const updateAccountSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(50, "First name is too long"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(50, "Last name is too long"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .max(120, "Email is too long")
    .toLowerCase()
    .refine(
      (val) => val === "admin" || emailValidator.safeParse(val).success,
      "Please enter a valid email address"
    ),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(128, "New password is too long"),
    repeatPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.repeatPassword, {
    message: "New passwords do not match",
    path: ["repeatPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from your current password",
    path: ["newPassword"],
  });

export type RegisterInputDTO = z.infer<typeof registerSchema>;
export type LoginInputDTO = z.infer<typeof loginSchema>;
export type UpdateAccountInputDTO = z.infer<typeof updateAccountSchema>;
export type ChangePasswordInputDTO = z.infer<typeof changePasswordSchema>;

export class AuthDTO {
  id!: number;
  firstName!: string;
  lastName!: string;
  email!: string;
  lastLoginAt!: string | null;
  loginCount!: number;
  failLoginCount!: number;
  createdAt!: string | null;
  updatedAt!: string | null;

  static fromEntity(user: UserEntity): AuthDTO {
    return {
      id: user.id!,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
      loginCount: user.loginCount,
      failLoginCount: user.failLoginCount,
      createdAt: user.createdAt ? user.createdAt.toISOString() : null,
      updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null,
    };
  }
}
