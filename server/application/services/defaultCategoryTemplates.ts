import { CategoryType } from "../../domain/entities/category/index.js";

export interface DefaultCategoryTemplate {
  name: string;
  description: string;
  type: CategoryType;
}

export const DEFAULT_KAKEIBO_CATEGORIES: DefaultCategoryTemplate[] = [
  // Four Kakeibo Expense Pillars (in exact order)
  { name: "Needs", description: "Essential living expenses", type: "EXPENSE" },
  { name: "Wants", description: "Discretionary purchases", type: "EXPENSE" },
  { name: "Culture", description: "Learning, books, and personal growth", type: "EXPENSE" },
  { name: "Unexpected", description: "Unplanned or emergency expenses", type: "EXPENSE" },
  // Default Income Categories
  { name: "Salary", description: "Primary employment income", type: "INCOME" },
  { name: "Business", description: "Self-employment or freelance earnings", type: "INCOME" },
  { name: "Investment", description: "Dividends, interest, and capital returns", type: "INCOME" },
  { name: "Bonus", description: "Performance or seasonal bonuses", type: "INCOME" },
  { name: "Other", description: "Miscellaneous income sources", type: "INCOME" },
];
