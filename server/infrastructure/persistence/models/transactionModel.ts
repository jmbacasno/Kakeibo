import {
  Category as PrismaCategory,
  Transaction as PrismaTransaction,
} from "@prisma/client";
import { Transaction, TransactionPlanSummary } from "../../../domain/entities/transaction/index.js";
import { CategoryModel } from "./categoryModel.js";

export type PrismaTransactionWithRelations = PrismaTransaction & {
  category?: PrismaCategory | null;
  monthlyPlan?: TransactionPlanSummary | null;
};

export class TransactionModel {
  static toEntity(raw: PrismaTransactionWithRelations): Transaction {
    return new Transaction({
      id: raw.id,
      monthlyPlanId: raw.monthlyPlanId,
      categoryId: raw.categoryId,
      amount: Number(raw.amount),
      description: raw.description,
      transactionDate: raw.transactionDate,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      category: raw.category ? CategoryModel.toEntity(raw.category) : null,
      monthlyPlan: raw.monthlyPlan || null,
    });
  }
}
