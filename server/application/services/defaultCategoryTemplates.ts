import { CategoryType } from "../../domain/entities/category/index.js";

export interface DefaultCategoryTemplate {
  name: string;
  type: CategoryType;
}

export const DEFAULT_KAKEIBO_CATEGORIES: DefaultCategoryTemplate[] = [
  // Four Kakeibo Expense Pillars
  { name: "Needs", type: "EXPENSE" },
  { name: "Wants", type: "EXPENSE" },
  { name: "Culture", type: "EXPENSE" },
  { name: "Unexpected", type: "EXPENSE" },
  // Default Income Categories
  { name: "Salary", type: "INCOME" },
  { name: "Business", type: "INCOME" },
  { name: "Investment", type: "INCOME" },
  { name: "Bonus", type: "INCOME" },
  { name: "Other", type: "INCOME" },
];
