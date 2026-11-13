import { CategoryBudgetRepositoryInterface } from "../../domain/repositories/categoryBudgetRepositoryInterface.js";
import { CategoryRepositoryInterface } from "../../domain/repositories/categoryRepositoryInterface.js";
import { MonthlyPlanRepositoryInterface } from "../../domain/repositories/monthlyPlanRepositoryInterface.js";
import { MonthlyReflectionRepositoryInterface } from "../../domain/repositories/monthlyReflectionRepositoryInterface.js";
import { NoteRepositoryInterface } from "../../domain/repositories/noteRepositoryInterface.js";
import { TransactionRepositoryInterface } from "../../domain/repositories/transactionRepositoryInterface.js";
import { UnitOfWorkInterface } from "../../domain/repositories/unitOfWorkInterface.js";
import { UserRepositoryInterface } from "../../domain/repositories/userRepositoryInterface.js";
import { prisma } from "../persistence/clients/prisma.js";
import { CategoryBudgetRepository } from "./categoryBudgetRepository.js";
import { CategoryRepository } from "./categoryRepository.js";
import { MonthlyPlanRepository } from "./monthlyPlanRepository.js";
import { MonthlyReflectionRepository } from "./monthlyReflectionRepository.js";
import { NoteRepository } from "./noteRepository.js";
import { TransactionRepository } from "./transactionRepository.js";
import { UserRepository } from "./userRepository.js";

export class UnitOfWork implements UnitOfWorkInterface {
  public users: UserRepositoryInterface;
  public categories: CategoryRepositoryInterface;
  public monthlyPlans: MonthlyPlanRepositoryInterface;
  public categoryBudgets: CategoryBudgetRepositoryInterface;
  public transactions: TransactionRepositoryInterface;
  public notes: NoteRepositoryInterface;
  public monthlyReflections: MonthlyReflectionRepositoryInterface;

  constructor(
    users?: UserRepositoryInterface,
    categories?: CategoryRepositoryInterface,
    monthlyPlans?: MonthlyPlanRepositoryInterface,
    categoryBudgets?: CategoryBudgetRepositoryInterface,
    transactions?: TransactionRepositoryInterface,
    notes?: NoteRepositoryInterface,
    monthlyReflections?: MonthlyReflectionRepositoryInterface
  ) {
    this.users = users || new UserRepository();
    this.categories = categories || new CategoryRepository();
    this.monthlyPlans = monthlyPlans || new MonthlyPlanRepository();
    this.categoryBudgets = categoryBudgets || new CategoryBudgetRepository();
    this.transactions = transactions || new TransactionRepository();
    this.notes = notes || new NoteRepository();
    this.monthlyReflections = monthlyReflections || new MonthlyReflectionRepository();
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
        new MonthlyReflectionRepository(tx)
      );
      return work(txUow);
    });
  }
}
