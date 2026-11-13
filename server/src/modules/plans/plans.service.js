import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { calcUtilizationPercent, sumDecimals, toDecimal, toMoneyNumber } from '../../utils/decimal.js';
import { AppError } from '../../utils/errors.js';

const Decimal = Prisma.Decimal;

export async function validateExpenseCategoriesForUser(tx, userId, categoryIds) {
  if (!categoryIds || categoryIds.length === 0) return [];
  const uniqueIds = [...new Set(categoryIds)];
  const categories = await tx.category.findMany({
    where: {
      id: { in: uniqueIds },
      userId,
    },
  });

  if (categories.length !== uniqueIds.length) {
    throw new AppError('One or more selected categories do not belong to your account.', 403);
  }

  const nonExpense = categories.find((c) => c.type !== 'EXPENSE');
  if (nonExpense) {
    throw new AppError(`Category "${nonExpense.name}" is an income category. Only expense categories can have budgets.`, 400);
  }

  return categories;
}

export function calculatePlanFinancials(plan) {
  const plannedIncome = toDecimal(plan.plannedIncome);
  const savingsGoal = toDecimal(plan.savingsGoal);
  const plannedAvailableExpenses = plannedIncome.minus(savingsGoal);

  const incomeTx = (plan.transactions || []).filter((t) => t.category?.type === 'INCOME');
  const expenseTx = (plan.transactions || []).filter((t) => t.category?.type === 'EXPENSE');

  const actualIncome = sumDecimals(incomeTx.map((t) => t.amount));
  const totalExpenses = sumDecimals(expenseTx.map((t) => t.amount));
  const actualSavings = actualIncome.minus(totalExpenses);

  const budgets = plan.budgets || [];
  const totalAllocatedBudget = sumDecimals(budgets.map((b) => b.allocatedAmount));
  const remainingBudget = totalAllocatedBudget.minus(totalExpenses);
  const allocationDifference = totalAllocatedBudget.minus(plannedAvailableExpenses);

  // Aggregate actual spending by categoryId
  const spendByCategoryId = new Map();
  const categoryMetaMap = new Map();

  for (const b of budgets) {
    categoryMetaMap.set(b.categoryId, b.category);
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

  const categoryBreakdown = [];
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
      categoryName: meta?.name || 'Unknown',
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

  categoryBreakdown.sort((a, b) => b.allocatedAmount - a.allocatedAmount || b.actualSpent - a.actualSpent);

  const overBudgetCategories = categoryBreakdown.filter((c) => c.isOverBudget && (c.allocatedAmount > 0 || c.actualSpent > 0));
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

export function serializePlan(plan) {
  const financials = calculatePlanFinancials(plan);
  return {
    id: plan.id,
    userId: plan.userId,
    month: plan.month,
    year: plan.year,
    plannedIncome: toMoneyNumber(plan.plannedIncome),
    savingsGoal: toMoneyNumber(plan.savingsGoal),
    status: plan.status,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
    budgets: (plan.budgets || []).map((b) => ({
      id: b.id,
      monthlyPlanId: b.monthlyPlanId,
      categoryId: b.categoryId,
      allocatedAmount: toMoneyNumber(b.allocatedAmount),
      category: b.category,
    })),
    summary: financials,
  };
}

const planInclude = {
  budgets: {
    include: {
      category: true,
    },
    orderBy: { categoryId: 'asc' },
  },
  transactions: {
    include: {
      category: true,
    },
  },
};

export async function listPlans(userId) {
  const plans = await prisma.monthlyPlan.findMany({
    where: { userId },
    include: planInclude,
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  });
  return plans.map(serializePlan);
}

export async function getPlanById(userId, planId) {
  const plan = await prisma.monthlyPlan.findFirst({
    where: { id: planId, userId },
    include: planInclude,
  });
  if (!plan) {
    throw new AppError('Monthly plan not found.', 404);
  }
  return serializePlan(plan);
}

export async function getPlanByMonthYear(userId, month, year) {
  const now = new Date();
  const targetMonth = month || now.getMonth() + 1;
  const targetYear = year || now.getFullYear();

  const plan = await prisma.monthlyPlan.findFirst({
    where: { userId, month: targetMonth, year: targetYear },
    include: planInclude,
  });

  if (!plan) {
    return null;
  }
  return serializePlan(plan);
}

export async function createPlan(userId, data) {
  const existing = await prisma.monthlyPlan.findFirst({
    where: { userId, month: data.month, year: data.year },
  });
  if (existing) {
    throw new AppError(`A monthly plan for ${data.month}/${data.year} already exists.`, 409);
  }

  const created = await prisma.$transaction(async (tx) => {
    const budgetItems = data.budgets || [];
    if (budgetItems.length > 0) {
      await validateExpenseCategoriesForUser(
        tx,
        userId,
        budgetItems.map((b) => b.categoryId)
      );
    }

    const plan = await tx.monthlyPlan.create({
      data: {
        userId,
        month: data.month,
        year: data.year,
        plannedIncome: toDecimal(data.plannedIncome),
        savingsGoal: toDecimal(data.savingsGoal),
        status: data.status || 'ACTIVE',
      },
    });

    for (const item of budgetItems) {
      await tx.categoryBudget.upsert({
        where: {
          monthlyPlanId_categoryId: {
            monthlyPlanId: plan.id,
            categoryId: item.categoryId,
          },
        },
        update: { allocatedAmount: toDecimal(item.allocatedAmount) },
        create: {
          monthlyPlanId: plan.id,
          categoryId: item.categoryId,
          allocatedAmount: toDecimal(item.allocatedAmount),
        },
      });
    }

    return tx.monthlyPlan.findUnique({
      where: { id: plan.id },
      include: planInclude,
    });
  });

  return serializePlan(created);
}

export async function updatePlan(userId, planId, data) {
  const existing = await prisma.monthlyPlan.findFirst({
    where: { id: planId, userId },
  });
  if (!existing) {
    throw new AppError('Monthly plan not found.', 404);
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (Array.isArray(data.budgets)) {
      await validateExpenseCategoriesForUser(
        tx,
        userId,
        data.budgets.map((b) => b.categoryId)
      );

      for (const item of data.budgets) {
        await tx.categoryBudget.upsert({
          where: {
            monthlyPlanId_categoryId: {
              monthlyPlanId: planId,
              categoryId: item.categoryId,
            },
          },
          update: { allocatedAmount: toDecimal(item.allocatedAmount) },
          create: {
            monthlyPlanId: planId,
            categoryId: item.categoryId,
            allocatedAmount: toDecimal(item.allocatedAmount),
          },
        });
      }
    }

    return tx.monthlyPlan.update({
      where: { id: planId },
      data: {
        ...(data.plannedIncome !== undefined ? { plannedIncome: toDecimal(data.plannedIncome) } : {}),
        ...(data.savingsGoal !== undefined ? { savingsGoal: toDecimal(data.savingsGoal) } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
      },
      include: planInclude,
    });
  });

  return serializePlan(updated);
}

export async function updatePlanStatus(userId, planId, status) {
  const existing = await prisma.monthlyPlan.findFirst({
    where: { id: planId, userId },
  });
  if (!existing) {
    throw new AppError('Monthly plan not found.', 404);
  }

  const updated = await prisma.monthlyPlan.update({
    where: { id: planId },
    data: { status },
    include: planInclude,
  });

  return serializePlan(updated);
}
