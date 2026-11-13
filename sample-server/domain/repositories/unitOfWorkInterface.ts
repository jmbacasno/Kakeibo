import { UserRepositoryInterface } from "./userRepositoryInterface.js";
import { CategoryRepositoryInterface } from "./categoryRepositoryInterface.js";
import { TaskRepositoryInterface } from "./taskRepositoryInterface.js";
import { PerfectDayRepositoryInterface } from "./perfectDayRepositoryInterface.js";

export interface UnitOfWorkInterface {
  users: UserRepositoryInterface;
  categories: CategoryRepositoryInterface;
  tasks: TaskRepositoryInterface;
  perfectDays: PerfectDayRepositoryInterface;
  commit(): Promise<void>;
  runInTransaction<T>(work: (uow: UnitOfWorkInterface) => Promise<T>): Promise<T>;
}
