import { prisma } from '../../config/prisma.js';
import { toDecimal, toMoneyNumber } from '../../utils/decimal.js';
import { AppError } from '../../utils/errors.js';
import { getPlanById, validateExpenseCategoriesForUser } from '../plans/plans.service.js';

export async function getPlanBudgets(userId, planId) {
  const plan = await getPlanById(userId, planId);
  return plan.budgets;
}

export async function replacePlanBudgets(userId, planId, budgets) {
  const plan = await prisma.monthlyPlan.findFirst({
    where: { id: planId, userId },
  });
  if (!plan) {
    throw new AppError('Monthly plan not found.', 404);
  }

  await prisma.$transaction(async (tx) => {
    await validateExpenseCategoriesForUser(
      tx,
      userId,
      budgets.map((b) => b.categoryId)
    );

    for (const item of budgets) {
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
  });

  return getPlanById(userId, planId);
}

export async function upsertSingleCategoryBudget(userId, planId, categoryId, allocatedAmount) {
  const plan = await prisma.monthlyPlan.findFirst({
    where: { id: planId, userId },
  });
  if (!plan) {
    throw new AppError('Monthly plan not found.', 404);
  }

  const result = await prisma.$transaction(async (tx) => {
    await validateExpenseCategoriesForUser(tx, userId, [categoryId]);

    const budget = await tx.categoryBudget.upsert({
      where: {
        monthlyPlanId_categoryId: {
          monthlyPlanId: planId,
          categoryId,
        },
      },
      update: { allocatedAmount: toDecimal(allocatedAmount) },
      create: {
        monthlyPlanId: planId,
        categoryId,
        allocatedAmount: toDecimal(allocatedAmount),
      },
      include: { category: true },
    });

    return {
      ...budget,
      allocatedAmount: toMoneyNumber(budget.allocatedAmount),
    };
  });

  return result;
}
