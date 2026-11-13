import { TaskRepositoryInterface } from "../../domain/repositories/taskRepositoryInterface.js";
import { TaskEntity } from "../../domain/entities/task/index.js";
import { prisma } from "../persistence/clients/prisma.js";
import { TaskModel } from "../persistence/models/taskModel.js";

export class TaskRepository implements TaskRepositoryInterface {
  constructor(private client = prisma) {}

  async findAllByUserId(userId: number): Promise<TaskEntity[]> {
    const tasks = await this.client.task.findMany({
      where: { userId },
      orderBy: { customOrder: "asc" },
      include: { category: true, steps: { orderBy: { customOrder: "asc" } } }
    });
    return tasks.map(TaskModel.toEntity);
  }

  async findByIdAndUserId(id: number, userId: number): Promise<TaskEntity | null> {
    const task = await this.client.task.findFirst({
      where: { id, userId },
      include: { category: true, steps: { orderBy: { customOrder: "asc" } } }
    });
    if (!task) return null;
    return TaskModel.toEntity(task);
  }

  async create(task: TaskEntity): Promise<TaskEntity> {
    const created = await this.client.task.create({
      data: {
        title: task.title,
        notes: task.notes,
        isCompleted: task.isCompleted,
        isImportant: task.isImportant,
        completedAt: task.completedAt,
        dueDate: task.dueDate.value,
        repeatType: task.repeatRule.repeatType,
        categoryId: task.categoryId,
        customOrder: task.customOrder,
        userId: task.userId,
        repeatFrequency: task.repeatRule.repeatFrequency,
        repeatWeeklyOnDays: task.repeatRule.repeatWeeklyOnDays,
        repeatMonthlyOnDay: task.repeatRule.repeatMonthlyOnDay,
        repeatEndsAtType: task.repeatRule.repeatEndsAtType,
        repeatEndsAtDateDate: task.repeatRule.repeatEndsAtDateDate,
        repeatEndsAtCountCount: task.repeatRule.repeatEndsAtCountCount,
        steps: task.steps && task.steps.length > 0 ? {
          create: task.steps.map(s => ({
            title: s.title,
            isCompleted: s.isCompleted,
            customOrder: s.customOrder
          }))
        } : undefined
      },
      include: { category: true, steps: { orderBy: { customOrder: "asc" } } }
    });
    return TaskModel.toEntity(created);
  }

  async update(task: TaskEntity): Promise<TaskEntity> {
    if (task.steps !== undefined) {
      await this.client.step.deleteMany({
        where: { taskId: task.id! }
      });
    }

    const updated = await this.client.task.update({
      where: { id: task.id! },
      data: {
        title: task.title,
        notes: task.notes,
        isCompleted: task.isCompleted,
        isImportant: task.isImportant,
        completedAt: task.completedAt,
        dueDate: task.dueDate.value,
        categoryId: task.categoryId,
        repeatType: task.repeatRule.repeatType,
        repeatFrequency: task.repeatRule.repeatFrequency,
        repeatWeeklyOnDays: task.repeatRule.repeatWeeklyOnDays,
        repeatMonthlyOnDay: task.repeatRule.repeatMonthlyOnDay,
        repeatEndsAtType: task.repeatRule.repeatEndsAtType,
        repeatEndsAtDateDate: task.repeatRule.repeatEndsAtDateDate,
        repeatEndsAtCountCount: task.repeatRule.repeatEndsAtCountCount,
        customOrder: task.customOrder,
        steps: task.steps ? {
          create: task.steps.map(s => ({
            title: s.title,
            isCompleted: s.isCompleted,
            customOrder: s.customOrder
          }))
        } : undefined
      },
      include: { category: true, steps: { orderBy: { customOrder: "asc" } } }
    });
    return TaskModel.toEntity(updated);
  }

  async delete(id: number): Promise<void> {
    await this.client.task.delete({ where: { id } });
  }

  async getMaxOrder(userId: number): Promise<number> {
    const maxOrderRes = await this.client.task.aggregate({
      where: { userId },
      _max: { customOrder: true }
    });
    return maxOrderRes._max.customOrder ?? 0;
  }

  async getMinOrder(userId: number): Promise<number> {
    const minOrderRes = await this.client.task.aggregate({
      where: { userId },
      _min: { customOrder: true }
    });
    return minOrderRes._min.customOrder ?? 0;
  }

  async reorder(userId: number, orderList: Array<{ id: number; customOrder: number }>): Promise<void> {
    await this.client.$transaction(
      orderList.map((item) =>
        this.client.task.update({
          where: { id: item.id, userId },
          data: { customOrder: item.customOrder }
        })
      )
    );
  }

  async bulkUpdate(userId: number, ids: number[], data: Partial<Omit<TaskEntity, "id" | "createdAt" | "updatedAt">>): Promise<void> {
    const prismaData: any = {};
    if (data.isCompleted !== undefined) {
      prismaData.isCompleted = data.isCompleted;
      if (data.completedAt !== undefined) {
        prismaData.completedAt = data.completedAt;
      }
    }
    if (data.isImportant !== undefined) {
      prismaData.isImportant = data.isImportant;
    }
    if (data.categoryId !== undefined) {
      prismaData.categoryId = data.categoryId;
    }
    if (data.dueDate !== undefined) {
      if (data.dueDate === null) {
        prismaData.dueDate = null;
      } else if (typeof data.dueDate === "string") {
        prismaData.dueDate = data.dueDate;
      } else {
        prismaData.dueDate = (data.dueDate as any).value;
      }
    }

    await this.client.task.updateMany({
      where: {
        id: { in: ids },
        userId
      },
      data: prismaData
    });
  }

  async bulkDelete(userId: number, ids: number[]): Promise<void> {
    await this.client.task.deleteMany({
      where: {
        id: { in: ids },
        userId
      }
    });
  }
}
