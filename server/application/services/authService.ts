import { Category } from "../../domain/entities/category/index.js";
import { User } from "../../domain/entities/user/index.js";
import { UnitOfWorkInterface } from "../../domain/repositories/unitOfWorkInterface.js";
import { PasswordHasherInterface } from "../../domain/services/passwordHasherInterface.js";
import { TokenServiceInterface } from "../../domain/services/tokenServiceInterface.js";
import { AuthDTO, loginSchema, registerSchema } from "../dtos/userDTO.js";
import { AuthenticationError, ConflictError, NotFoundError } from "../errors.js";
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

  private signUserToken(user: { id: number | null; email: string; name: string }): string {
    return this.tokenService.generateToken({
      sub: String(user.id),
      id: user.id,
      email: user.email,
      name: user.name,
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
        name: input.name,
        email: input.email,
        passwordHash,
        createdAt: now,
        updatedAt: now,
      });

      const savedUser = await txUow.users.create(userEntity);

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

    const valid = await this.passwordHasher.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new AuthenticationError("Invalid email/username or password.");
    }

    const token = this.signUserToken(user);
    return {
      user: AuthDTO.fromEntity(user),
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
}
