import { prisma } from '../../config/prisma.js';
import { toDecimal, toMoneyNumber } from '../../utils/decimal.js';
import { AppError } from '../../utils/errors.js';

function parseNormalizedDate(dateStr) {
  // Handle YYYY-MM-DD cleanly at midday UTC to avoid timezone day-shift
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const month = Number(dateOnlyMatch[2]);
    const day = Number(dateOnlyMatch[3]);
    const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) {
      throw new AppError('Invalid calendar date.', 400);
    }
    return { date: d, year, month };
  }

  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) {
    throw new AppError('Invalid transaction date.', 400);
  }
  return {
    date: parsed,
    year: parsed.getUTCFullYear(),
    month: parsed.getUTCMonth() + 1,
  };
}

function serializeTransaction(tx) {
  return {
    id: tx.id,
    monthlyPlanId: tx.monthlyPlanId,
    categoryId: tx.categoryId,
    amount: toMoneyNumber(tx.amount),
    description: tx.description,
    transactionDate: tx.transactionDate.toISOString().slice(0, 10),
    createdAt: tx.createdAt,
    updatedAt: tx.updatedAt,
    type: tx.category?.type || null,
    category: tx.category
      ? {
          id: tx.category.id,
          name: tx.category.name,
          type: tx.category.type,
          isDefault: tx.category.isDefault,
          isActive: tx.category.isActive,
        }
      : null,
    monthlyPlan: tx.monthlyPlan
      ? {
          id: tx.monthlyPlan.id,
          month: tx.monthlyPlan.month,
          year: tx.monthlyPlan.year,
        }
      : null,
  };
}

export async function listTransactions(userId, query) {
  const {
    planId,
    categoryId,
    type,
    startDate,
    endDate,
    search,
    sortBy = 'date',
    sortOrder = 'desc',
    page = 1,
    limit = 50,
  } = query;

  const where = {
    monthlyPlan: { userId },
  };

  if (planId) where.monthlyPlanId = planId;
  if (categoryId) where.categoryId = categoryId;
  if (type) where.category = { type };

  if (startDate || endDate) {
    where.transactionDate = {};
    if (startDate) {
      where.transactionDate.gte = new Date(`${startDate.slice(0, 10)}T00:00:00.000Z`);
    }
    if (endDate) {
      where.transactionDate.lte = new Date(`${endDate.slice(0, 10)}T23:59:59.999Z`);
    }
  }

  if (search) {
    where.description = { contains: search };
  }

  const orderBy =
    sortBy === 'amount'
      ? [{ amount: sortOrder }, { transactionDate: 'desc' }, { id: 'desc' }]
      : [{ transactionDate: sortOrder }, { id: sortOrder }];

  const skip = (page - 1) * limit;

  const [total, items] = await prisma.$transaction([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      include: {
        category: true,
        monthlyPlan: { select: { id: true, month: true, year: true } },
      },
      orderBy,
      skip,
      take: limit,
    }),
  ]);

  return {
    transactions: items.map(serializeTransaction),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function getTransactionById(userId, id) {
  const tx = await prisma.transaction.findFirst({
    where: {
      id,
      monthlyPlan: { userId },
    },
    include: {
      category: true,
      monthlyPlan: { select: { id: true, month: true, year: true } },
    },
  });

  if (!tx) {
    throw new AppError('Transaction not found.', 404);
  }
  return serializeTransaction(tx);
}

export async function createTransaction(userId, data) {
  const plan = await prisma.monthlyPlan.findFirst({
    where: { id: data.monthlyPlanId, userId },
  });
  if (!plan) {
    throw new AppError('Selected monthly plan does not exist or belong to you.', 404);
  }

  const category = await prisma.category.findFirst({
    where: { id: data.categoryId, userId },
  });
  if (!category) {
    throw new AppError('Selected category does not exist or belong to you.', 404);
  }
  if (!category.isActive) {
    throw new AppError('Archived categories cannot be used for new transactions.', 400);
  }

  const { date, year, month } = parseNormalizedDate(data.transactionDate);
  if (year !== plan.year || month !== plan.month) {
    throw new AppError(
      `Transaction date must fall within the selected plan month (${plan.month}/${plan.year}).`,
      400
    );
  }

  const created = await prisma.transaction.create({
    data: {
      monthlyPlanId: plan.id,
      categoryId: category.id,
      amount: toDecimal(data.amount),
      description: data.description,
      transactionDate: date,
    },
    include: {
      category: true,
      monthlyPlan: { select: { id: true, month: true, year: true } },
    },
  });

  return serializeTransaction(created);
}

export async function updateTransaction(userId, id, data) {
  const existing = await prisma.transaction.findFirst({
    where: { id, monthlyPlan: { userId } },
    include: { monthlyPlan: true, category: true },
  });

  if (!existing) {
    throw new AppError('Transaction not found.', 404);
  }

  const targetPlanId = data.monthlyPlanId ?? existing.monthlyPlanId;
  const plan =
    targetPlanId === existing.monthlyPlanId
      ? existing.monthlyPlan
      : await prisma.monthlyPlan.findFirst({ where: { id: targetPlanId, userId } });

  if (!plan) {
    throw new AppError('Selected monthly plan does not exist or belong to you.', 404);
  }

  const targetCategoryId = data.categoryId ?? existing.categoryId;
  if (targetCategoryId !== existing.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: targetCategoryId, userId },
    });
    if (!category) {
      throw new AppError('Selected category does not exist or belong to you.', 404);
    }
    if (!category.isActive) {
      throw new AppError('Archived categories cannot be assigned to transactions.', 400);
    }
  }

  let nextDate = existing.transactionDate;
  if (data.transactionDate !== undefined) {
    const parsed = parseNormalizedDate(data.transactionDate);
    nextDate = parsed.date;
    if (parsed.year !== plan.year || parsed.month !== plan.month) {
      throw new AppError(
        `Transaction date must fall within the selected plan month (${plan.month}/${plan.year}).`,
        400
      );
    }
  } else if (data.monthlyPlanId !== undefined) {
    const existingYear = existing.transactionDate.getUTCFullYear();
    const existingMonth = existing.transactionDate.getUTCMonth() + 1;
    if (existingYear !== plan.year || existingMonth !== plan.month) {
      throw new AppError(
        `Transaction date must fall within the selected plan month (${plan.month}/${plan.year}).`,
        400
      );
    }
  }

  const updated = await prisma.transaction.update({
    where: { id },
    data: {
      monthlyPlanId: plan.id,
      categoryId: targetCategoryId,
      ...(data.amount !== undefined ? { amount: toDecimal(data.amount) } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      transactionDate: nextDate,
    },
    include: {
      category: true,
      monthlyPlan: { select: { id: true, month: true, year: true } },
    },
  });

  return serializeTransaction(updated);
}

export async function deleteTransaction(userId, id) {
  const existing = await prisma.transaction.findFirst({
    where: { id, monthlyPlan: { userId } },
  });
  if (!existing) {
    throw new AppError('Transaction not found.', 404);
  }

  await prisma.transaction.delete({ where: { id } });
  return { id };
}
