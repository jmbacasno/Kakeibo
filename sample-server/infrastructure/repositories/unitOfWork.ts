import { UnitOfWorkInterface } from "../../domain/repositories/unitOfWorkInterface.js";
import { UserRepositoryInterface } from "../../domain/repositories/userRepositoryInterface.js";
import { CategoryRepositoryInterface } from "../../domain/repositories/categoryRepositoryInterface.js";
import { TaskRepositoryInterface } from "../../domain/repositories/taskRepositoryInterface.js";
import { PerfectDayRepositoryInterface } from "../../domain/repositories/perfectDayRepositoryInterface.js";
import { UserRepository } from "./userRepository.js";
import { CategoryRepository } from "./categoryRepository.js";
import { TaskRepository } from "./taskRepository.js";
import { PerfectDayRepository } from "./perfectDayRepository.js";
import { prisma } from "../persistence/clients/prisma.js";

export class UnitOfWork implements UnitOfWorkInterface {
  public users: UserRepositoryInterface;
  public categories: CategoryRepositoryInterface;
  public tasks: TaskRepositoryInterface;
  public perfectDays: PerfectDayRepositoryInterface;

  constructor(
    users?: UserRepositoryInterface,
    categories?: CategoryRepositoryInterface,
    tasks?: TaskRepositoryInterface,
    perfectDays?: PerfectDayRepositoryInterface
  ) {
    this.users = users || new UserRepository();
    this.categories = categories || new CategoryRepository();
    this.tasks = tasks || new TaskRepository();
    this.perfectDays = perfectDays || new PerfectDayRepository();
  }

  async commit(): Promise<void> {
    // Placeholder command as operations directly interact with the Prisma Client state.
  }

  async runInTransaction<T>(work: (uow: UnitOfWorkInterface) => Promise<T>): Promise<T> {
    return prisma.$transaction(async (tx) => {
      const transactionalUow = new UnitOfWork(
        new UserRepository(tx as any),
        new CategoryRepository(tx as any),
        new TaskRepository(tx as any),
        new PerfectDayRepository(tx as any)
      );
      return work(transactionalUow);
    });
  }
}
