import { AuthService } from "../application/services/authService.js";
import { CategoryBudgetService } from "../application/services/categoryBudgetService.js";
import { CategoryService } from "../application/services/categoryService.js";
import { DashboardService } from "../application/services/dashboardService.js";
import { MonthlyPlanService } from "../application/services/monthlyPlanService.js";
import { MonthlyReflectionService } from "../application/services/monthlyReflectionService.js";
import { NoteService } from "../application/services/noteService.js";
import { TransactionService } from "../application/services/transactionService.js";
import { UserSettingsService } from "../application/services/userSettingsService.js";
import { settings } from "../infrastructure/config.js";
import { Logger } from "../infrastructure/logging/logger.js";
import { UnitOfWork } from "../infrastructure/database/prisma/unitOfWork.js";
import { PasswordHasher } from "../infrastructure/security/passwordHasher.js";
import { TokenService } from "../infrastructure/security/tokenService.js";

export const unitOfWork = new UnitOfWork();
export const passwordHasher = new PasswordHasher(settings.bcryptSaltRounds);
export const tokenService = new TokenService(
  settings.jwtSecret,
  settings.jwtAlgorithm,
  settings.jwtExpiresMinutes
);
export const logger = new Logger(settings.logLevel, settings.logFormat, settings.nodeEnv);

export const authApplicationService = new AuthService(unitOfWork, passwordHasher, tokenService);
export const categoryApplicationService = new CategoryService(unitOfWork);
export const monthlyPlanApplicationService = new MonthlyPlanService(unitOfWork);
export const categoryBudgetApplicationService = new CategoryBudgetService(unitOfWork);
export const transactionApplicationService = new TransactionService(unitOfWork);
export const noteApplicationService = new NoteService(unitOfWork);
export const monthlyReflectionApplicationService = new MonthlyReflectionService(unitOfWork);
export const dashboardApplicationService = new DashboardService(unitOfWork);
export const userSettingsApplicationService = new UserSettingsService(unitOfWork);
