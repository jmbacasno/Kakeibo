import { Category } from "../../domain/entities/category/index.js";
import { User } from "../../domain/entities/user/index.js";
import { DEFAULT_USER_SETTINGS, UserSettings } from "../../domain/entities/userSettings/index.js";
import { UnitOfWorkInterface } from "../../domain/repositories/unitOfWorkInterface.js";
import { PasswordHasherInterface } from "../../domain/services/passwordHasherInterface.js";
import { TokenServiceInterface } from "../../domain/services/tokenServiceInterface.js";
import {
  AuthDTO,
  changePasswordSchema,
  loginSchema,
  registerSchema,
  updateAccountSchema,
} from "../dtos/userDTO.js";
import { AuthenticationError, ConflictError, NotFoundError, ValidationError } from "../errors.js";
import { parseDTO } from "../validation.js";
import { DEFAULT_KAKEIBO_CATEGORIES } from "./defaultCategoryTemplates.js";

export interface AuthSessionResult {
  user: AuthDTO;
  token: string;
}

export class AuthService {
  constructor(
    private readonly uow: UnitOfWorkInterface,
    private readonly passwordHasher: PasswordHasherInterface,
    private readonly tokenService: TokenServiceInterface
  ) {}

  private signUserToken(user: {
    id: number | null;
    email: string;
    firstName: string;
    lastName: string;
  }): string {
    return this.tokenService.generateToken({
      sub: String(user.id),
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  }

  async register(rawData: unknown): Promise<AuthSessionResult> {
    const input = parseDTO(registerSchema, rawData);

    const existing = await this.uow.users.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("An account with this email already exists.");
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const now = new Date();

    const createdUser = await this.uow.runInTransaction(async (txUow) => {
      const userEntity = new User({
        id: null,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        password: passwordHash,
        lastLoginAt: now,
        loginCount: 1,
        failLoginCount: 0,
        createdAt: now,
        updatedAt: now,
      });

      const savedUser = await txUow.users.create(userEntity);

      const defaultSettings = new UserSettings({
        id: null,
        userId: savedUser.id!,
        currency: DEFAULT_USER_SETTINGS.currency,
        language: DEFAULT_USER_SETTINGS.language,
        theme: DEFAULT_USER_SETTINGS.theme,
        dateFormat: DEFAULT_USER_SETTINGS.dateFormat,
        firstDayOfWeek: DEFAULT_USER_SETTINGS.firstDayOfWeek,
        createdAt: now,
        updatedAt: now,
      });
      await txUow.userSettings.create(defaultSettings);

      for (const template of DEFAULT_KAKEIBO_CATEGORIES) {
        const categoryEntity = new Category({
          id: null,
          userId: savedUser.id!,
          name: template.name,
          type: template.type,
          isDefault: true,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });
        await txUow.categories.create(categoryEntity);
      }

      return savedUser;
    });

    const token = this.signUserToken(createdUser);
    return {
      user: AuthDTO.fromEntity(createdUser),
      token,
    };
  }

  async login(rawData: unknown): Promise<AuthSessionResult> {
    const input = parseDTO(loginSchema, rawData);

    const user = await this.uow.users.findByEmail(input.email);
    if (!user) {
      throw new AuthenticationError("Invalid email/username or password.");
    }

    const valid = await this.passwordHasher.compare(input.password, user.password);
    if (!valid) {
      await this.uow.users.recordFailedLogin(user.id!);
      throw new AuthenticationError("Invalid email/username or password.");
    }

    const updatedUser = await this.uow.users.recordSuccessfulLogin(user.id!, new Date());
    const token = this.signUserToken(updatedUser);
    return {
      user: AuthDTO.fromEntity(updatedUser),
      token,
    };
  }

  async getMe(userId: number): Promise<AuthDTO> {
    const user = await this.uow.users.findById(userId);
    if (!user) {
      throw new NotFoundError("User account not found.");
    }
    return AuthDTO.fromEntity(user);
  }

  async updateAccount(userId: number, rawData: unknown): Promise<AuthSessionResult> {
    const input = parseDTO(updateAccountSchema, rawData);
    const user = await this.uow.users.findById(userId);
    if (!user) {
      throw new NotFoundError("User account not found.");
    }

    if (input.email !== user.email) {
      const existing = await this.uow.users.findByEmail(input.email);
      if (existing && existing.id !== userId) {
        throw new ConflictError("An account with this email already exists.");
      }
    }

    const updatedEntity = new User({
      id: user.id,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      password: user.password,
      lastLoginAt: user.lastLoginAt,
      loginCount: user.loginCount,
      failLoginCount: user.failLoginCount,
      createdAt: user.createdAt,
      updatedAt: new Date(),
    });

    const saved = await this.uow.users.update(updatedEntity);
    const token = this.signUserToken(saved);
    return {
      user: AuthDTO.fromEntity(saved),
      token,
    };
  }

  async changePassword(userId: number, rawData: unknown): Promise<void> {
    const input = parseDTO(changePasswordSchema, rawData);
    const user = await this.uow.users.findById(userId);
    if (!user) {
      throw new NotFoundError("User account not found.");
    }

    const matchesCurrent = await this.passwordHasher.compare(input.currentPassword, user.password);
    if (!matchesCurrent) {
      throw new ValidationError("Current password is incorrect.");
    }

    const nextHash = await this.passwordHasher.hash(input.newPassword);
    const updatedEntity = new User({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: nextHash,
      lastLoginAt: user.lastLoginAt,
      loginCount: user.loginCount,
      failLoginCount: user.failLoginCount,
      createdAt: user.createdAt,
      updatedAt: new Date(),
    });

    await this.uow.users.update(updatedEntity);
  }
}
