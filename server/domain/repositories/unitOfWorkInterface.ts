import { CategoryBudgetRepositoryInterface } from "./categoryBudgetRepositoryInterface.js";
import { CategoryRepositoryInterface } from "./categoryRepositoryInterface.js";
import { MonthlyPlanRepositoryInterface } from "./monthlyPlanRepositoryInterface.js";
import { MonthlyReflectionRepositoryInterface } from "./monthlyReflectionRepositoryInterface.js";
import { NoteRepositoryInterface } from "./noteRepositoryInterface.js";
import { TransactionRepositoryInterface } from "./transactionRepositoryInterface.js";
import { UserRepositoryInterface } from "./userRepositoryInterface.js";
import { UserSettingsRepositoryInterface } from "./userSettingsRepositoryInterface.js";

export interface UnitOfWorkInterface {
  users: UserRepositoryInterface;
  userSettings: UserSettingsRepositoryInterface;
  categories: CategoryRepositoryInterface;
  monthlyPlans: MonthlyPlanRepositoryInterface;
  categoryBudgets: CategoryBudgetRepositoryInterface;
  transactions: TransactionRepositoryInterface;
  notes: NoteRepositoryInterface;
  monthlyReflections: MonthlyReflectionRepositoryInterface;
  commit(): Promise<void>;
  runInTransaction<T>(work: (uow: UnitOfWorkInterface) => Promise<T>): Promise<T>;
}
