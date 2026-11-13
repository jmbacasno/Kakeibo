import { UnitOfWorkInterface } from "../../domain/repositories/unitOfWorkInterface.js";
import { PasswordHasherInterface } from "../../domain/services/passwordHasherInterface.js";
import { TokenServiceInterface } from "../../domain/services/tokenServiceInterface.js";
import { ApplicationError, ValidationError } from "../errors.js";
import { UserEntity, User } from "../../domain/entities/user/index.js";
import { Category } from "../../domain/entities/category/index.js";
import { Task, RepeatRule } from "../../domain/entities/task/index.js";
import { Step } from "../../domain/entities/step/index.js";
import { RegisterInputDTO, LoginInputDTO, AuthDTO, registerSchema, loginSchema } from "../dtos/userDTO.js";
import { parseDTO } from "../validation.js";


export interface AuthenticationResultDTO {
  user: AuthDTO;
  token: string;
}

export class AuthService {
  constructor(
    private uow: UnitOfWorkInterface,
    private passwordHasher: PasswordHasherInterface,
    private tokenService: TokenServiceInterface
  ) {}

  async registerUser(rawInput: unknown): Promise<AuthenticationResultDTO> {
    const input = parseDTO(registerSchema, rawInput);

    const normalizedEmail = (input.email || "").trim().toLowerCase();
    
    // Domain Validation using User class
    new User({
      email: normalizedEmail,
      name: input.name || normalizedEmail.split("@")[0] || null,
      password: input.password,
      createdAt: null,
      id: null,
      updatedAt: null,
    });

    const existing = await this.uow.users.findByEmail(normalizedEmail);
    if (existing) {
      throw new ApplicationError("An account with this email already exists");
    }

    const hashedPassword = await this.passwordHasher.hash(input.password || "");

    const newUserDraft = new User({
      email: normalizedEmail,
      password: hashedPassword,
      name: input.name || normalizedEmail.split("@")[0],
      createdAt: null,
      id: null,
      updatedAt: null,
    });

    const newUser = await this.uow.users.create(newUserDraft);

    // Onboarding presets using repository actions
    await this.uow.categories.create(new Category({ name: "Work", color: "purple", userId: newUser.id, createdAt: null, id: null, updatedAt: null }));
    await this.uow.categories.create(new Category({ name: "Personal", color: "pink", userId: newUser.id, createdAt: null, id: null, updatedAt: null }));
    await this.uow.categories.create(new Category({ name: "Urgent", color: "red", userId: newUser.id, createdAt: null, id: null, updatedAt: null }));

    // Seed onboarding tasks for the new user
    const repeatRuleNone = new RepeatRule({
      repeatType: "none",
      repeatFrequency: null,
      repeatWeeklyOnDays: null,
      repeatMonthlyOnDay: null,
      repeatEndsAtType: null,
      repeatEndsAtDateDate: null,
      repeatEndsAtCountCount: null,
    });

    // Task (1) Add your first task by clicking on + Add Task
    await this.uow.tasks.create(new Task({
      title: "Add your first task by clicking on + Add Task",
      userId: newUser.id,
      repeatRule: repeatRuleNone,
      customOrder: 1,
    }));

    // Task (2) Select this task to add a due date
    await this.uow.tasks.create(new Task({
      title: "Select this task to add a due date",
      userId: newUser.id,
      repeatRule: repeatRuleNone,
      customOrder: 2,
    }));

    // Task (3) Break this task into smaller steps, with step "Here's your first step - add some more!"
    await this.uow.tasks.create(new Task({
      title: "Break this task into smaller steps",
      userId: newUser.id,
      repeatRule: repeatRuleNone,
      customOrder: 3,
      steps: [
        new Step({
          title: "Here's your first step - add some more!",
          isCompleted: false,
          customOrder: 1,
          taskId: 0,
        })
      ]
    }));

    // Task (4) Open this task and select a category
    await this.uow.tasks.create(new Task({
      title: "Open this task and select a category",
      userId: newUser.id,
      repeatRule: repeatRuleNone,
      customOrder: 4,
    }));

    // Task (5) Tap all the checkbox in this list to complete your tasks
    await this.uow.tasks.create(new Task({
      title: "Tap all the checkbox in this list to complete your tasks",
      userId: newUser.id,
      repeatRule: repeatRuleNone,
      customOrder: 5,
    }));

    const userDTO = AuthDTO.fromEntity(newUser);
    const token = this.tokenService.generateToken({ id: userDTO.id, email: userDTO.email, name: userDTO.name });

    return { user: userDTO, token };
  }

  async loginUser(rawInput: unknown): Promise<AuthenticationResultDTO> {
    const input = parseDTO(loginSchema, rawInput);

    const normalizedEmail = input.email.trim().toLowerCase();
    const user = await this.uow.users.findByEmail(normalizedEmail);
    if (!user || !user.password) {
      throw new ApplicationError("Invalid email or password credentials");
    }

    const isMatch = await this.passwordHasher.compare(input.password || "", user.password);
    if (!isMatch) {
      throw new ApplicationError("Invalid email or password credentials");
    }

    const userDTO = AuthDTO.fromEntity(user);
    const token = this.tokenService.generateToken({ id: userDTO.id, email: userDTO.email, name: userDTO.name });

    return { user: userDTO, token };
  }
}
