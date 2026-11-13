import { z } from "zod";
import { CategoryType } from "../../domain/entities/category/index.js";
import { TransactionEntity, TransactionPlanSummary } from "../../domain/entities/transaction/index.js";
import { toMoneyNumber } from "../../domain/services/financialCalculator.js";
import { CategoryDTO } from "./categoryDTO.js";

function parseTransactionDate(value: unknown): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate(), 12, 0, 0));
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
    if (dateOnlyMatch) {
      const y = Number(dateOnlyMatch[1]);
      const m = Number(dateOnlyMatch[2]);
      const d = Number(dateOnlyMatch[3]);
      return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    }
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  throw new Error("Invalid transaction date");
}

const dateInputSchema = z.preprocess((val) => {
  if (typeof val === "string" || val instanceof Date) {
    try {
      return parseTransactionDate(val);
    } catch {
      return val;
    }
  }
  return val;
}, z.date({ error: "Transaction date must be a valid date" }));

export const createTransactionSchema = z.object({
  monthlyPlanId: z.coerce.number().int().positive("Invalid monthly plan ID"),
  categoryId: z.coerce.number().int().positive("Please select a category"),
  amount: z.coerce
    .number({ error: "Amount must be a valid number" })
    .positive("Amount must be greater than zero")
    .max(999999999.99, "Amount is too large"),
  description: z.string().trim().min(1, "Description is required").max(255, "Description is too long"),
  transactionDate: dateInputSchema,
});

export const updateTransactionSchema = z.object({
  monthlyPlanId: z.coerce.number().int().positive("Invalid monthly plan ID").optional(),
  categoryId: z.coerce.number().int().positive("Please select a category").optional(),
  amount: z.coerce
    .number({ error: "Amount must be a valid number" })
    .positive("Amount must be greater than zero")
    .max(999999999.99, "Amount is too large")
    .optional(),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(255, "Description is too long")
    .optional(),
  transactionDate: dateInputSchema.optional(),
});

export const listTransactionsQuerySchema = z.object({
  planId: z.coerce.number().int().positive().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  startDate: dateInputSchema.optional(),
  endDate: dateInputSchema.optional(),
  search: z.string().trim().max(120).optional(),
  sortBy: z.enum(["date", "amount"]).optional().default("date"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(25),
});

export class TransactionDTO {
  id!: number;
  monthlyPlanId!: number;
  categoryId!: number;
  type!: CategoryType;
  amount!: number;
  description!: string;
  transactionDate!: string;
  createdAt!: string | null;
  updatedAt!: string | null;
  category!: CategoryDTO | null;
  monthlyPlan!: TransactionPlanSummary | null;

  static fromEntity(tx: TransactionEntity): TransactionDTO {
    return {
      id: tx.id!,
      monthlyPlanId: tx.monthlyPlanId,
      categoryId: tx.categoryId,
      type: (tx.category?.type as CategoryType) || "EXPENSE",
      amount: toMoneyNumber(tx.amount),
      description: tx.description,
      transactionDate: tx.transactionDate.toISOString().slice(0, 10),
      createdAt: tx.createdAt ? tx.createdAt.toISOString() : null,
      updatedAt: tx.updatedAt ? tx.updatedAt.toISOString() : null,
      category: tx.category ? CategoryDTO.fromEntity(tx.category) : null,
      monthlyPlan: tx.monthlyPlan || null,
    };
  }
}
