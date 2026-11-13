import { UnitOfWork } from "../infrastructure/repositories/unitOfWork.js";
import { PasswordHasher } from "../infrastructure/security/passwordHasher.js";
import { TokenService } from "../infrastructure/security/tokenService.js";
import { Logger } from "../infrastructure/logging/logger.js";
import { AuthService } from "../application/services/authService.js";
import { UserService } from "../application/services/userService.js";
import { CategoryService } from "../application/services/categoryService.js";
import { TaskService } from "../application/services/taskService.js";
import { PerfectDayService } from "../application/services/perfectDayService.js";
import { settings } from "../infrastructure/config.js";

export const unitOfWork = new UnitOfWork();
export const passwordHasher = new PasswordHasher(settings.bcryptSaltRounds);
export const tokenService = new TokenService(
  settings.jwtSecret,
  settings.jwtAlgorithm,
  settings.jwtExpiresMinutes
);
export const logger = new Logger(
  settings.logLevel,
  settings.logFormat,
  settings.nodeEnv
);

export const authApplicationService = new AuthService(unitOfWork, passwordHasher, tokenService);
export const userApplicationService = new UserService(unitOfWork, passwordHasher);
export const categoryApplicationService = new CategoryService(unitOfWork);
export const taskApplicationService = new TaskService(unitOfWork);
export const perfectDayApplicationService = new PerfectDayService(unitOfWork);
