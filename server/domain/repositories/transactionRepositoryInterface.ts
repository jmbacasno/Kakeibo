import { CategoryType } from "../entities/category/index.js";
import { TransactionEntity } from "../entities/transaction/index.js";

export interface TransactionFilterParams {
  planId?: number;
  categoryId?: number;
  type?: CategoryType;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  sortBy: "date" | "amount";
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
}

export interface PaginatedTransactionsResult {
  transactions: TransactionEntity[];
  total: number;
}

export interface TransactionRepositoryInterface {
  findManyByUserId(
    userId: number,
    filters: TransactionFilterParams
  ): Promise<PaginatedTransactionsResult>;
  findByIdAndUserId(id: number, userId: number): Promise<TransactionEntity | null>;
  create(data: {
    monthlyPlanId: number;
    categoryId: number;
    amount: number;
    description: string;
    transactionDate: Date;
  }): Promise<TransactionEntity>;
  update(
    id: number,
    data: {
      monthlyPlanId?: number;
      categoryId?: number;
      amount?: number;
      description?: string;
      transactionDate?: Date;
    }
  ): Promise<TransactionEntity>;
  delete(id: number): Promise<void>;
}
