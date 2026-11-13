import { UnitOfWorkInterface } from "../../domain/repositories/unitOfWorkInterface.js";
import { Task, RepeatRule, CalendarDate } from "../../domain/entities/task/index.js";
import { Step } from "../../domain/entities/step/index.js";
import { ApplicationError, ValidationError } from "../errors.js";
import { CreateTaskDTO, UpdateTaskDTO, TaskDTO, createTaskSchema, updateTaskSchema } from "../dtos/taskDTO.js";
import { parseDTO } from "../validation.js";


export class TaskService {
  constructor(private uow: UnitOfWorkInterface) {}

  async getTasks(userId: number): Promise<TaskDTO[]> {
    const tasks = await this.uow.tasks.findAllByUserId(userId);
    return tasks.map(t => TaskDTO.fromEntity(t));
  }

  async createTask(userId: number, rawParams: unknown): Promise<TaskDTO> {
    const params = parseDTO(createTaskSchema, rawParams);
    const isImportant = params.isImportant ?? false;
    let finalOrder: number;
    if (isImportant) {
      const minOrder = await this.uow.tasks.getMinOrder(userId);
      finalOrder = minOrder - 1;
    } else {
      const maxOrder = await this.uow.tasks.getMaxOrder(userId);
      finalOrder = maxOrder + 1;
    }

    // Validate using Domain Task class
    const draft = new Task({
      title: params.title,
      notes: params.notes || "",
      isCompleted: false,
      isImportant,
      dueDate: params.dueDate ? String(params.dueDate).trim() : null,
      repeatRule: new RepeatRule({
        repeatType: params.repeatType || "none",
        repeatFrequency: params.repeatFrequency ? parseInt(params.repeatFrequency as any, 10) : null,
        repeatWeeklyOnDays: (params.repeatWeeklyOnDays && params.repeatWeeklyOnDays.trim() !== "") ? params.repeatWeeklyOnDays : null,
        repeatMonthlyOnDay: params.repeatMonthlyOnDay ? parseInt(params.repeatMonthlyOnDay as any, 10) : null,
        repeatEndsAtType: params.repeatEndsAtType !== undefined ? params.repeatEndsAtType : (params.repeatType === "none" ? null : "endlessly"),
        repeatEndsAtDateDate: params.repeatEndsAtDateDate ? String(params.repeatEndsAtDateDate).trim() : null,
        repeatEndsAtCountCount: params.repeatEndsAtCountCount ? parseInt(params.repeatEndsAtCountCount as any, 10) : null,
      }),
      categoryId: params.categoryId ?? null,
      customOrder: finalOrder,
      userId,
      createdAt: null,
      id: null,
      updatedAt: null,
      steps: params.steps ? params.steps.map(s => new Step({
        title: s.title,
        isCompleted: s.isCompleted,
        customOrder: s.customOrder,
        taskId: 0
      })) : []
    });

    const task = await this.uow.tasks.create(draft);
    return TaskDTO.fromEntity(task);
  }

  async reorderTasks(userId: number, orderList: Array<{ id: number; customOrder: number }>): Promise<void> {
    if (!Array.isArray(orderList)) {
      throw new ValidationError("Order list must be an array");
    }
    await this.uow.tasks.reorder(userId, orderList);
  }

  async editTask(userId: number, taskId: number, rawParams: unknown): Promise<TaskDTO> {
    const params = parseDTO(updateTaskSchema, rawParams);
    return this.uow.runInTransaction(async (tx) => {
      const existing = await tx.tasks.findByIdAndUserId(taskId, userId);
      if (!existing) {
        throw new ApplicationError("Task not found or access denied");
      }

      const r = existing.repeatRule;
      const updatedRepeatRule = new RepeatRule({
        repeatType: params.repeatType !== undefined ? params.repeatType : r.repeatType,
        repeatFrequency: params.repeatFrequency !== undefined 
          ? (params.repeatFrequency !== null ? parseInt(params.repeatFrequency as any, 10) : null)
          : r.repeatFrequency,
        repeatWeeklyOnDays: params.repeatWeeklyOnDays !== undefined ? (params.repeatWeeklyOnDays && params.repeatWeeklyOnDays.trim() !== "" ? params.repeatWeeklyOnDays : null) : r.repeatWeeklyOnDays,
        repeatMonthlyOnDay: params.repeatMonthlyOnDay !== undefined 
          ? (params.repeatMonthlyOnDay !== null ? parseInt(params.repeatMonthlyOnDay as any, 10) : null)
          : r.repeatMonthlyOnDay,
        repeatEndsAtType: params.repeatEndsAtType !== undefined ? params.repeatEndsAtType : r.repeatEndsAtType,
        repeatEndsAtDateDate: params.repeatEndsAtDateDate !== undefined 
          ? (params.repeatEndsAtDateDate ? String(params.repeatEndsAtDateDate).trim() : null) 
          : r.repeatEndsAtDateDate,
        repeatEndsAtCountCount: params.repeatEndsAtCountCount !== undefined
          ? (params.repeatEndsAtCountCount !== null ? parseInt(params.repeatEndsAtCountCount as any, 10) : null)
          : r.repeatEndsAtCountCount,
      });

      // Mutate via the Domain Entity class's native update method directly (excluding isCompleted and completedAt edits here)
      const richTask = existing as Task;
      let finalOrder = richTask.customOrder;
      if (params.isImportant === true && !richTask.isImportant) {
        const minOrder = await tx.tasks.getMinOrder(userId);
        finalOrder = minOrder - 1;
      }

      richTask.update({
        title: params.title,
        notes: params.notes,
        isImportant: params.isImportant,
        dueDate: params.dueDate !== undefined ? new CalendarDate(params.dueDate ? String(params.dueDate).trim() : null) : undefined,
        categoryId: params.categoryId,
        repeatRule: updatedRepeatRule,
        customOrder: finalOrder,
      });

      if (params.steps !== undefined) {
        richTask.steps = params.steps.map(s => new Step({
          id: s.id,
          title: s.title,
          isCompleted: s.isCompleted,
          customOrder: s.customOrder,
          taskId: taskId
        }));
      }

      const updated = await tx.tasks.update(richTask);
      return TaskDTO.fromEntity(updated);
    });
  }

  async completeTask(userId: number, taskId: number, clientLocalDate?: string): Promise<{ updated: TaskDTO; repeatSpawned: TaskDTO | null; perfectDayLogged: boolean; }> {
    return this.uow.runInTransaction(async (tx) => {
      const existing = await tx.tasks.findByIdAndUserId(taskId, userId);
      if (!existing) {
        throw new ApplicationError("Task not found or access denied");
      }

      // Check perfect day condition BEFORE completing the task, or we can check during transaction
      let perfectDayLogged = false;
      if (clientLocalDate && existing.dueDate.value === clientLocalDate && !existing.isCompleted) {
        const allTasks = await tx.tasks.findAllByUserId(userId);
        const otherUncompletedToday = allTasks.filter(t => !t.isCompleted && t.dueDate.value === clientLocalDate && t.id !== taskId);
        if (otherUncompletedToday.length === 0) {
          const alreadyLogged = await tx.perfectDays.findByUserIdAndDate(userId, clientLocalDate);
          if (!alreadyLogged) {
            await tx.perfectDays.create({
              id: null,
              date: clientLocalDate,
              userId,
              createdAt: null,
              updatedAt: null,
            });
            perfectDayLogged = true;
          } else {
            await tx.perfectDays.update(alreadyLogged);
            perfectDayLogged = true;
          }
        }
      }

      // Handle automated recurrence spawning trigger using rich domain entity logic
      const isCompleting = true;
      const evaluation = existing.evaluateRecurrence(isCompleting, existing.isCompleted);

      let repeatSpawnedDraft: Task | null = null;
      if (evaluation.shouldSpawn && evaluation.nextDueDate) {
        repeatSpawnedDraft = new Task({
          title: existing.title,
          notes: existing.notes,
          isCompleted: false,
          isImportant: existing.isImportant,
          completedAt: null,
          dueDate: evaluation.nextDueDate.value,
          repeatRule: new RepeatRule({
            repeatType: existing.repeatRule.repeatType,
            repeatFrequency: existing.repeatRule.repeatFrequency,
            repeatWeeklyOnDays: existing.repeatRule.repeatWeeklyOnDays,
            repeatMonthlyOnDay: existing.repeatRule.repeatMonthlyOnDay,
            repeatEndsAtType: existing.repeatRule.repeatEndsAtType,
            repeatEndsAtDateDate: existing.repeatRule.repeatEndsAtDateDate,
            repeatEndsAtCountCount: evaluation.newRemainingCount,
          }),
          categoryId: existing.categoryId,
          customOrder: existing.customOrder,
          userId,
          createdAt: null,
          id: null,
          updatedAt: null,
          steps: existing.steps ? existing.steps.map(s => new Step({
            title: s.title,
            isCompleted: false,
            customOrder: s.customOrder,
            taskId: 0
          })) : []
        });
      }

      const updatedRepeatRule = new RepeatRule({
        repeatType: "none",
        repeatFrequency: null,
        repeatWeeklyOnDays: null,
        repeatMonthlyOnDay: null,
        repeatEndsAtType: null,
        repeatEndsAtDateDate: null,
        repeatEndsAtCountCount: null,
      });

      // Mutate domain representation
      const richTask = existing as Task;
      richTask.update({
        isCompleted: true,
        completedAt: new Date(),
        repeatRule: updatedRepeatRule,
      });

      const updated = await tx.tasks.update(richTask);
      let repeatSpawnedMapped: TaskDTO | null = null;
      if (repeatSpawnedDraft) {
        const repeatSpawned = await tx.tasks.create(repeatSpawnedDraft);
        repeatSpawnedMapped = TaskDTO.fromEntity(repeatSpawned);
      }

      return {
        updated: TaskDTO.fromEntity(updated),
        repeatSpawned: repeatSpawnedMapped,
        perfectDayLogged
      };
    });
  }

  async uncompleteTask(userId: number, taskId: number): Promise<TaskDTO> {
    return this.uow.runInTransaction(async (tx) => {
      const existing = await tx.tasks.findByIdAndUserId(taskId, userId);
      if (!existing) {
        throw new ApplicationError("Task not found or access denied");
      }

      const richTask = existing as Task;
      richTask.update({
        isCompleted: false,
        completedAt: null,
      });

      const updated = await tx.tasks.update(richTask);
      return TaskDTO.fromEntity(updated);
    });
  }

  async duplicateTask(userId: number, taskId: number): Promise<TaskDTO> {
    return this.uow.runInTransaction(async (tx) => {
      const existing = await tx.tasks.findByIdAndUserId(taskId, userId);
      if (!existing) {
        throw new ApplicationError("Task not found or access denied");
      }
      const maxOrder = await tx.tasks.getMaxOrder(userId);
      const nextOrder = maxOrder + 1;

      const duplicateDraft = new Task({
        title: `${existing.title} (Copy)`,
        notes: existing.notes,
        isCompleted: false,
        isImportant: existing.isImportant,
        completedAt: null,
        dueDate: existing.dueDate,
        repeatRule: new RepeatRule({
          repeatType: existing.repeatRule.repeatType,
          repeatFrequency: existing.repeatRule.repeatFrequency,
          repeatWeeklyOnDays: existing.repeatRule.repeatWeeklyOnDays,
          repeatMonthlyOnDay: existing.repeatRule.repeatMonthlyOnDay,
          repeatEndsAtType: existing.repeatRule.repeatEndsAtType,
          repeatEndsAtDateDate: existing.repeatRule.repeatEndsAtDateDate,
          repeatEndsAtCountCount: existing.repeatRule.repeatEndsAtCountCount,
        }),
        categoryId: existing.categoryId,
        customOrder: nextOrder,
        userId,
        createdAt: null,
        id: null,
        updatedAt: null,
        steps: existing.steps ? existing.steps.map(s => new Step({
          title: s.title,
          isCompleted: s.isCompleted,
          customOrder: s.customOrder,
          taskId: 0
        })) : []
      });

      const duplicated = await tx.tasks.create(duplicateDraft);
      return TaskDTO.fromEntity(duplicated);
    });
  }

  async deleteTask(userId: number, taskId: number): Promise<void> {
    const check = await this.uow.tasks.findByIdAndUserId(taskId, userId);
    if (!check) {
      throw new ApplicationError("Task not found or access denied");
    }
    await this.uow.tasks.delete(taskId);
  }

  async editTasks(userId: number, taskIds: number[], rawParams: unknown): Promise<void> {
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      throw new ValidationError("Task IDs must be a non-empty array");
    }
    const params = parseDTO(updateTaskSchema, rawParams);
    
    const updateData: any = {};
    if (params.categoryId !== undefined) {
      updateData.categoryId = params.categoryId;
    }
    if (params.dueDate !== undefined) {
      updateData.dueDate = new CalendarDate(params.dueDate !== null ? String(params.dueDate).trim() : null);
    }

    await this.uow.tasks.bulkUpdate(userId, taskIds, updateData);
  }

  async completeTasks(userId: number, taskIds: number[], clientLocalDate?: string): Promise<boolean> {
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      throw new ValidationError("Task IDs must be a non-empty array");
    }

    return this.uow.runInTransaction(async (tx) => {
      const allTasks = await tx.tasks.findAllByUserId(userId);
      const targetTasks = allTasks.filter(t => t.id !== null && taskIds.includes(t.id));

      let hasTodayTask = false;
      for (const existing of targetTasks) {
        if (!existing.isCompleted && clientLocalDate && existing.dueDate.value === clientLocalDate) {
          hasTodayTask = true;
        }

        if (existing.isCompleted) continue;

        const isCompleting = true;
        const evaluation = existing.evaluateRecurrence(isCompleting, existing.isCompleted);

        let repeatSpawnedDraft: Task | null = null;
        if (evaluation.shouldSpawn && evaluation.nextDueDate) {
          repeatSpawnedDraft = new Task({
            title: existing.title,
            notes: existing.notes,
            isCompleted: false,
            isImportant: existing.isImportant,
            completedAt: null,
            dueDate: evaluation.nextDueDate.value,
            repeatRule: new RepeatRule({
              repeatType: existing.repeatRule.repeatType,
              repeatFrequency: existing.repeatRule.repeatFrequency,
              repeatWeeklyOnDays: existing.repeatRule.repeatWeeklyOnDays,
              repeatMonthlyOnDay: existing.repeatRule.repeatMonthlyOnDay,
              repeatEndsAtType: existing.repeatRule.repeatEndsAtType,
              repeatEndsAtDateDate: existing.repeatRule.repeatEndsAtDateDate,
              repeatEndsAtCountCount: evaluation.newRemainingCount,
            }),
            categoryId: existing.categoryId,
            customOrder: existing.customOrder,
            userId,
            createdAt: null,
            id: null,
            updatedAt: null,
            steps: existing.steps ? existing.steps.map(s => new Step({
              title: s.title,
              isCompleted: false,
              customOrder: s.customOrder,
              taskId: 0
            })) : []
          });
        }

        const updatedRepeatRule = new RepeatRule({
          repeatType: "none",
          repeatFrequency: null,
          repeatWeeklyOnDays: null,
          repeatMonthlyOnDay: null,
          repeatEndsAtType: null,
          repeatEndsAtDateDate: null,
          repeatEndsAtCountCount: null,
        });

        const richTask = existing as Task;
        richTask.update({
          isCompleted: true,
          completedAt: new Date(),
          repeatRule: updatedRepeatRule,
        });

        await tx.tasks.update(richTask);

        if (repeatSpawnedDraft) {
          await tx.tasks.create(repeatSpawnedDraft);
        }
      }

      let perfectDayLogged = false;
      if (clientLocalDate && hasTodayTask) {
        // Find other uncompleted today tasks (excluding the ones we just completed)
        const otherUncompletedToday = allTasks.filter(t => !t.isCompleted && t.dueDate.value === clientLocalDate && t.id !== null && !taskIds.includes(t.id));
        if (otherUncompletedToday.length === 0) {
          const alreadyLogged = await tx.perfectDays.findByUserIdAndDate(userId, clientLocalDate);
          if (!alreadyLogged) {
            await tx.perfectDays.create({
              id: null,
              date: clientLocalDate,
              userId,
              createdAt: null,
              updatedAt: null,
            });
            perfectDayLogged = true;
          } else {
            await tx.perfectDays.update(alreadyLogged);
            perfectDayLogged = true;
          }
        }
      }

      return perfectDayLogged;
    });
  }

  async deleteTasks(userId: number, taskIds: number[]): Promise<void> {
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      throw new ValidationError("Task IDs must be a non-empty array");
    }

    await this.uow.tasks.bulkDelete(userId, taskIds);
  }
}
