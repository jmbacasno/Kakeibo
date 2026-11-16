import { Transaction } from "../../domain/entities/transaction/index.js";
import { UnitOfWorkInterface } from "../../domain/repositories/unitOfWorkInterface.js";
import {
  createTransactionSchema,
  listTransactionsQuerySchema,
  TransactionDTO,
  updateTransactionSchema,
} from "../dtos/transactionDTO.js";
import { NotFoundError, ValidationError } from "../errors.js";
import { parseDTO } from "../validation.js";

export interface PaginatedTransactionsDTO {
  transactions: TransactionDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function assertDateWithinPlan(date: Date, plan: { month: number; year: number }): void {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  if (year !== plan.year || month !== plan.month) {
    throw new ValidationError(
      `Transaction date must fall within the selected monthly plan (${plan.month}/${plan.year}).`
    );
  }
}

export class TransactionService {
  constructor(private readonly uow: UnitOfWorkInterface) {}

  async listTransactions(userId: number, rawQuery: unknown): Promise<PaginatedTransactionsDTO> {
    const query = parseDTO(listTransactionsQuerySchema, rawQuery || {});

    const { transactions, total } = await this.uow.transactions.findManyByUserId(userId, {
      planId: query.planId,
      categoryId: query.categoryId,
      type: query.type,
      startDate: query.startDate,
      endDate: query.endDate,
      search: query.search,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      page: query.page,
      limit: query.limit,
    });

    return {
      transactions: transactions.map((t) => TransactionDTO.fromEntity(t)),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  }

  async getTransactionById(userId: number, transactionId: number): Promise<TransactionDTO> {
    const tx = await this.uow.transactions.findByIdAndUserId(transactionId, userId);
    if (!tx) {
      throw new NotFoundError("Transaction not found.");
    }
    return TransactionDTO.fromEntity(tx);
  }

  async createTransaction(userId: number, rawData: unknown): Promise<TransactionDTO> {
    const input = parseDTO(createTransactionSchema, rawData);

    const plan = await this.uow.monthlyPlans.findByIdAndUserId(input.monthlyPlanId, userId);
    if (!plan) {
      throw new NotFoundError("Monthly plan not found.");
    }

    const category = await this.uow.categories.findByIdAndUserId(input.categoryId, userId);
    if (!category) {
      throw new NotFoundError("Selected category not found.");
    }

    assertDateWithinPlan(input.transactionDate, plan);

    const entity = new Transaction({
      id: null,
      monthlyPlanId: plan.id!,
      categoryId: category.id!,
      amount: input.amount,
      description: input.description,
      transactionDate: input.transactionDate,
      createdAt: null,
      updatedAt: null,
    });

    const created = await this.uow.transactions.create({
      monthlyPlanId: entity.monthlyPlanId,
      categoryId: entity.categoryId,
      amount: entity.amount,
      description: entity.description,
      transactionDate: entity.transactionDate,
    });

    return TransactionDTO.fromEntity(created);
  }

  async updateTransaction(
    userId: number,
    transactionId: number,
    rawData: unknown
  ): Promise<TransactionDTO> {
    const input = parseDTO(updateTransactionSchema, rawData);

    const existing = await this.uow.transactions.findByIdAndUserId(transactionId, userId);
    if (!existing) {
      throw new NotFoundError("Transaction not found.");
    }

    const targetPlanId = input.monthlyPlanId ?? existing.monthlyPlanId;
    const plan = await this.uow.monthlyPlans.findByIdAndUserId(targetPlanId, userId);
    if (!plan) {
      throw new NotFoundError("Monthly plan not found.");
    }

    const targetCategoryId = input.categoryId ?? existing.categoryId;
    if (targetCategoryId !== existing.categoryId) {
      const category = await this.uow.categories.findByIdAndUserId(targetCategoryId, userId);
      if (!category) {
        throw new NotFoundError("Selected category not found.");
      }
    }

    const targetDate = input.transactionDate ?? existing.transactionDate;
    assertDateWithinPlan(targetDate, plan);

    const merged = new Transaction({
      id: existing.id,
      monthlyPlanId: targetPlanId,
      categoryId: targetCategoryId,
      amount: input.amount ?? existing.amount,
      description: input.description ?? existing.description,
      transactionDate: targetDate,
      createdAt: existing.createdAt,
      updatedAt: existing.updatedAt,
    });

    const updated = await this.uow.transactions.update(transactionId, {
      monthlyPlanId: merged.monthlyPlanId,
      categoryId: merged.categoryId,
      amount: merged.amount,
      description: merged.description,
      transactionDate: merged.transactionDate,
    });

    return TransactionDTO.fromEntity(updated);
  }

  async deleteTransaction(userId: number, transactionId: number): Promise<void> {
    const existing = await this.uow.transactions.findByIdAndUserId(transactionId, userId);
    if (!existing) {
      throw new NotFoundError("Transaction not found.");
    }
    await this.uow.transactions.delete(transactionId);
  }
}
