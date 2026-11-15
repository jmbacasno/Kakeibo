import { CategoryBudgetRepositoryInterface } from "../../../domain/repositories/categoryBudgetRepositoryInterface.js";
import { CategoryRepositoryInterface } from "../../../domain/repositories/categoryRepositoryInterface.js";
import { MonthlyPlanRepositoryInterface } from "../../../domain/repositories/monthlyPlanRepositoryInterface.js";
import { MonthlyReflectionRepositoryInterface } from "../../../domain/repositories/monthlyReflectionRepositoryInterface.js";
import { NoteRepositoryInterface } from "../../../domain/repositories/noteRepositoryInterface.js";
import { TransactionRepositoryInterface } from "../../../domain/repositories/transactionRepositoryInterface.js";
import { UnitOfWorkInterface } from "../../../domain/repositories/unitOfWorkInterface.js";
import { UserRepositoryInterface } from "../../../domain/repositories/userRepositoryInterface.js";
import { UserSettingsRepositoryInterface } from "../../../domain/repositories/userSettingsRepositoryInterface.js";
import { prisma } from "./client.js";
import { CategoryBudgetRepository } from "./repositories/categoryBudgetRepository.js";
import { CategoryRepository } from "./repositories/categoryRepository.js";
import { MonthlyPlanRepository } from "./repositories/monthlyPlanRepository.js";
import { MonthlyReflectionRepository } from "./repositories/monthlyReflectionRepository.js";
import { NoteRepository } from "./repositories/noteRepository.js";
import { TransactionRepository } from "./repositories/transactionRepository.js";
import { UserRepository } from "./repositories/userRepository.js";
import { UserSettingsRepository } from "./repositories/userSettingsRepository.js";

export class UnitOfWork implements UnitOfWorkInterface {
  public users: UserRepositoryInterface;
  public categories: CategoryRepositoryInterface;
  public monthlyPlans: MonthlyPlanRepositoryInterface;
  public categoryBudgets: CategoryBudgetRepositoryInterface;
  public transactions: TransactionRepositoryInterface;
  public notes: NoteRepositoryInterface;
  public monthlyReflections: MonthlyReflectionRepositoryInterface;
  public userSettings: UserSettingsRepositoryInterface;

  constructor(
    users?: UserRepositoryInterface,
    categories?: CategoryRepositoryInterface,
    monthlyPlans?: MonthlyPlanRepositoryInterface,
    categoryBudgets?: CategoryBudgetRepositoryInterface,
    transactions?: TransactionRepositoryInterface,
    notes?: NoteRepositoryInterface,
    monthlyReflections?: MonthlyReflectionRepositoryInterface,
    userSettings?: UserSettingsRepositoryInterface
  ) {
    this.users = users || new UserRepository();
    this.categories = categories || new CategoryRepository();
    this.monthlyPlans = monthlyPlans || new MonthlyPlanRepository();
    this.categoryBudgets = categoryBudgets || new CategoryBudgetRepository();
    this.transactions = transactions || new TransactionRepository();
    this.notes = notes || new NoteRepository();
    this.monthlyReflections = monthlyReflections || new MonthlyReflectionRepository();
    this.userSettings = userSettings || new UserSettingsRepository();
  }

  async commit(): Promise<void> {
    // Prisma executes atomic persistence operations per call or within $transaction.
  }

  async runInTransaction<T>(work: (uow: UnitOfWorkInterface) => Promise<T>): Promise<T> {
    return prisma.$transaction(async (tx) => {
      const txUow = new UnitOfWork(
        new UserRepository(tx),
        new CategoryRepository(tx),
        new MonthlyPlanRepository(tx),
        new CategoryBudgetRepository(tx),
        new TransactionRepository(tx),
        new NoteRepository(tx),
        new MonthlyReflectionRepository(tx),
        new UserSettingsRepository(tx)
      );
      return work(txUow);
    });
  }
}
