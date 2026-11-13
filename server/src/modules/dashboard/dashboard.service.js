import { z } from 'zod';
import { prisma } from '../../config/prisma.js';
import { calculatePlanFinancials } from '../plans/plans.service.js';
import { toMoneyNumber } from '../../utils/decimal.js';

export const dashboardQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

const emptySummary = {
  plannedIncome: 0,
  actualIncome: 0,
  savingsGoal: 0,
  actualSavings: 0,
  savingsProgressPercent: 0,
  plannedAvailableExpenses: 0,
  totalAllocatedBudget: 0,
  totalExpenses: 0,
  remainingBudget: 0,
  allocationDifference: 0,
  allocationExceedsAvailable: false,
  overallUtilizationPercent: 0,
  categoryBreakdown: [],
  overBudgetCategories: [],
};

export async function getDashboardData(userId, query = {}) {
  const now = new Date();
  const month = query.month || now.getMonth() + 1;
  const year = query.year || now.getFullYear();

  const [plan, availableMonths] = await Promise.all([
    prisma.monthlyPlan.findFirst({
      where: { userId, month, year },
      include: {
        budgets: {
          include: { category: true },
          orderBy: { categoryId: 'asc' },
        },
        transactions: {
          include: { category: true },
          orderBy: [{ transactionDate: 'desc' }, { id: 'desc' }],
        },
      },
    }),
    prisma.monthlyPlan.findMany({
      where: { userId },
      select: { id: true, month: true, year: true, status: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    }),
  ]);

  if (!plan) {
    return {
      month,
      year,
      hasPlan: false,
      plan: null,
      summary: emptySummary,
      recentTransactions: [],
      availableMonths,
    };
  }

  const summary = calculatePlanFinancials(plan);
  const recentTransactions = plan.transactions.slice(0, 8).map((tx) => ({
    id: tx.id,
    monthlyPlanId: tx.monthlyPlanId,
    categoryId: tx.categoryId,
    amount: toMoneyNumber(tx.amount),
    description: tx.description,
    transactionDate: tx.transactionDate.toISOString().slice(0, 10),
    type: tx.category?.type || null,
    category: tx.category
      ? {
          id: tx.category.id,
          name: tx.category.name,
          type: tx.category.type,
          isActive: tx.category.isActive,
        }
      : null,
  }));

  return {
    month,
    year,
    hasPlan: true,
    plan: {
      id: plan.id,
      month: plan.month,
      year: plan.year,
      plannedIncome: toMoneyNumber(plan.plannedIncome),
      savingsGoal: toMoneyNumber(plan.savingsGoal),
      status: plan.status,
    },
    summary,
    recentTransactions,
    availableMonths,
  };
}
