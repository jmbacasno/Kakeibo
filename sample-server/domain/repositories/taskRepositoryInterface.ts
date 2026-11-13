import { TaskEntity } from "../entities/task/index.js";

export interface TaskRepositoryInterface {
  findAllByUserId(userId: number): Promise<TaskEntity[]>;
  findByIdAndUserId(id: number, userId: number): Promise<TaskEntity | null>;
  create(task: TaskEntity): Promise<TaskEntity>;
  update(task: TaskEntity): Promise<TaskEntity>;
  delete(id: number): Promise<void>;
  getMaxOrder(userId: number): Promise<number>;
  getMinOrder(userId: number): Promise<number>;
  reorder(userId: number, orderList: Array<{ id: number; customOrder: number }>): Promise<void>;
  bulkUpdate(userId: number, ids: number[], data: Partial<Omit<TaskEntity, "id" | "createdAt" | "updatedAt">>): Promise<void>;
  bulkDelete(userId: number, ids: number[]): Promise<void>;
}
