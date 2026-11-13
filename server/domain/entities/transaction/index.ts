import { CategoryEntity } from "../category/index.js";
import { validateTransactionAmount, validateTransactionDescription } from "./validators.js";

export interface TransactionPlanSummary {
  id: number;
  month: number;
  year: number;
}

export interface TransactionEntity {
  id: number | null;
  monthlyPlanId: number;
  categoryId: number;
  amount: number;
  description: string;
  transactionDate: Date;
  createdAt: Date | null;
  updatedAt: Date | null;
  category?: CategoryEntity | null;
  monthlyPlan?: TransactionPlanSummary | null;
}

export class Transaction implements TransactionEntity {
  id: number | null;
  monthlyPlanId: number;
  categoryId: number;
  amount: number;
  description: string;
  transactionDate: Date;
  createdAt: Date | null;
  updatedAt: Date | null;
  category?: CategoryEntity | null;
  monthlyPlan?: TransactionPlanSummary | null;

  constructor(data: TransactionEntity) {
    this.id = data.id;
    this.monthlyPlanId = data.monthlyPlanId;
    this.categoryId = data.categoryId;
    this.amount = data.amount;
    this.description = data.description.trim();
    this.transactionDate = data.transactionDate;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.category = data.category;
    this.monthlyPlan = data.monthlyPlan;

    this.validate();
  }

  validate(): void {
    validateTransactionAmount(this.amount);
    validateTransactionDescription(this.description);
  }
}
