import { Prisma } from "@prisma/client";
import { CategoryType } from "../entities/category/index.js";

const Decimal = Prisma.Decimal;

export type DecimalInput = Prisma.Decimal | number | string | null | undefined;

export interface CategoryBreakdownItem {
  categoryId: number;
  categoryName: string;
  isDefault: boolean;
  isActive: boolean;
  allocatedAmount: number;
  actualSpent: number;
  remainingBudget: number;
  utilizationPercent: number;
  isOverBudget: boolean;
  hasZeroAllocation: boolean;
}

export interface PlanSummaryResult {
  plannedIncome: number;
  actualIncome: number;
  savingsGoal: number;
  actualSavings: number;
  savingsProgressPercent: number;
  plannedAvailableExpenses: number;
  totalAllocatedBudget: number;
  totalExpenses: number;
  remainingBudget: number;
  allocationDifference: number;
  allocationExceedsAvailable: boolean;
  overallUtilizationPercent: number;
  categoryBreakdown: CategoryBreakdownItem[];
  overBudgetCategories: CategoryBreakdownItem[];
}

export interface FinancialBudgetInput {
  categoryId: number;
  allocatedAmount: DecimalInput;
  category?: {
    id: number | null;
    name: string;
    isDefault: boolean;
    isActive: boolean;
  } | null;
}

export interface FinancialTransactionInput {
  categoryId: number;
  amount: DecimalInput;
  category?: {
    id: number | null;
    name: string;
    type: CategoryType | string;
    isDefault: boolean;
    isActive: boolean;
  } | null;
}

export function toDecimal(value: DecimalInput): Prisma.Decimal {
  if (value === null || value === undefined || value === "") {
    return new Decimal(0);
  }
  return new Decimal(value);
}

export function sumDecimals(values: DecimalInput[]): Prisma.Decimal {
  return values.reduce<Prisma.Decimal>(
    (acc, val) => acc.plus(toDecimal(val)),
    new Decimal(0)
  );
}

export function toMoneyNumber(value: DecimalInput): number {
  return Number(toDecimal(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2));
}

export function calcUtilizationPercent(actual: DecimalInput, allocated: DecimalInput): number {
  const allocDec = toDecimal(allocated);
  if (allocDec.lte(0)) {
    return 0;
  }
  const actualDec = toDecimal(actual);
  const pct = actualDec.div(allocDec).mul(100);
  return Number(pct.toDecimalPlaces(1, Decimal.ROUND_HALF_UP).toFixed(1));
}

export function calculatePlanSummary(
  plannedIncomeInput: DecimalInput,
  savingsGoalInput: DecimalInput,
  budgets: FinancialBudgetInput[],
  transactions: FinancialTransactionInput[]
): PlanSummaryResult {
  const plannedIncome = toDecimal(plannedIncomeInput);
  const savingsGoal = toDecimal(savingsGoalInput);
  const plannedAvailableExpenses = plannedIncome.minus(savingsGoal);

  const incomeTx = transactions.filter((t) => t.category?.type === "INCOME");
  const expenseTx = transactions.filter((t) => t.category?.type === "EXPENSE");

  const actualIncome = sumDecimals(incomeTx.map((t) => t.amount));
  const totalExpenses = sumDecimals(expenseTx.map((t) => t.amount));
  const actualSavings = actualIncome.minus(totalExpenses);

  const totalAllocatedBudget = sumDecimals(budgets.map((b) => b.allocatedAmount));
  const remainingBudget = totalAllocatedBudget.minus(totalExpenses);
  const allocationDifference = totalAllocatedBudget.minus(plannedAvailableExpenses);

  const spendByCategoryId = new Map<number, Prisma.Decimal>();
  const categoryMetaMap = new Map<
    number,
    { id: number | null; name: string; isDefault: boolean; isActive: boolean }
  >();

  for (const b of budgets) {
    if (b.category) {
      categoryMetaMap.set(b.categoryId, b.category);
    }
  }
  for (const t of expenseTx) {
    const current = spendByCategoryId.get(t.categoryId) || new Decimal(0);
    spendByCategoryId.set(t.categoryId, current.plus(toDecimal(t.amount)));
    if (t.category && !categoryMetaMap.has(t.categoryId)) {
      categoryMetaMap.set(t.categoryId, t.category);
    }
  }

  const budgetByCategoryId = new Map(budgets.map((b) => [b.categoryId, b]));
  const allCategoryIds = new Set([...budgetByCategoryId.keys(), ...spendByCategoryId.keys()]);

  const categoryBreakdown: CategoryBreakdownItem[] = [];
  for (const categoryId of allCategoryIds) {
    const budgetRecord = budgetByCategoryId.get(categoryId);
    const meta = categoryMetaMap.get(categoryId);
    const allocatedDec = budgetRecord ? toDecimal(budgetRecord.allocatedAmount) : new Decimal(0);
    const actualDec = spendByCategoryId.get(categoryId) || new Decimal(0);
    const remainingDec = allocatedDec.minus(actualDec);
    const utilizationPercent = calcUtilizationPercent(actualDec, allocatedDec);
    const isOverBudget = actualDec.gt(allocatedDec);

    categoryBreakdown.push({
      categoryId,
      categoryName: meta?.name || "Unknown",
      isDefault: Boolean(meta?.isDefault),
      isActive: meta?.isActive ?? true,
      allocatedAmount: toMoneyNumber(allocatedDec),
      actualSpent: toMoneyNumber(actualDec),
      remainingBudget: toMoneyNumber(remainingDec),
      utilizationPercent,
      isOverBudget,
      hasZeroAllocation: allocatedDec.lte(0),
    });
  }

  categoryBreakdown.sort(
    (a, b) => b.allocatedAmount - a.allocatedAmount || b.actualSpent - a.actualSpent
  );

  const overBudgetCategories = categoryBreakdown.filter(
    (c) => c.isOverBudget && (c.allocatedAmount > 0 || c.actualSpent > 0)
  );
  const savingsProgressPercent = savingsGoal.gt(0)
    ? calcUtilizationPercent(actualSavings.gt(0) ? actualSavings : new Decimal(0), savingsGoal)
    : 0;

  return {
    plannedIncome: toMoneyNumber(plannedIncome),
    actualIncome: toMoneyNumber(actualIncome),
    savingsGoal: toMoneyNumber(savingsGoal),
    actualSavings: toMoneyNumber(actualSavings),
    savingsProgressPercent,
    plannedAvailableExpenses: toMoneyNumber(plannedAvailableExpenses),
    totalAllocatedBudget: toMoneyNumber(totalAllocatedBudget),
    totalExpenses: toMoneyNumber(totalExpenses),
    remainingBudget: toMoneyNumber(remainingBudget),
    allocationDifference: toMoneyNumber(allocationDifference),
    allocationExceedsAvailable: allocationDifference.gt(0),
    overallUtilizationPercent: calcUtilizationPercent(totalExpenses, totalAllocatedBudget),
    categoryBreakdown,
    overBudgetCategories,
  };
}
