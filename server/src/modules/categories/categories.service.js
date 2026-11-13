import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';

export async function listCategories(userId, filters = {}) {
  const where = { userId };
  if (filters.type) where.type = filters.type;
  if (typeof filters.isActive === 'boolean') where.isActive = filters.isActive;

  return prisma.category.findMany({
    where,
    include: {
      _count: {
        select: {
          transactions: true,
          categoryBudgets: true,
        },
      },
    },
    orderBy: [{ type: 'asc' }, { isDefault: 'desc' }, { name: 'asc' }],
  });
}

export async function getCategoryById(userId, id) {
  const category = await prisma.category.findFirst({
    where: { id, userId },
    include: {
      _count: {
        select: {
          transactions: true,
          categoryBudgets: true,
        },
      },
    },
  });

  if (!category) {
    throw new AppError('Category not found.', 404);
  }
  return category;
}

export async function createCategory(userId, { name, type }) {
  const duplicate = await prisma.category.findFirst({
    where: { userId, type, name },
  });
  if (duplicate) {
    throw new AppError(`A ${type.toLowerCase()} category named "${name}" already exists.`, 409);
  }

  return prisma.category.create({
    data: {
      userId,
      name,
      type,
      isDefault: false,
      isActive: true,
    },
    include: {
      _count: {
        select: {
          transactions: true,
          categoryBudgets: true,
        },
      },
    },
  });
}

export async function updateCategory(userId, id, { name }) {
  const existing = await prisma.category.findFirst({
    where: { id, userId },
  });
  if (!existing) {
    throw new AppError('Category not found.', 404);
  }

  const duplicate = await prisma.category.findFirst({
    where: {
      userId,
      type: existing.type,
      name,
      NOT: { id },
    },
  });
  if (duplicate) {
    throw new AppError(`Another ${existing.type.toLowerCase()} category named "${name}" already exists.`, 409);
  }

  return prisma.category.update({
    where: { id },
    data: { name },
    include: {
      _count: {
        select: {
          transactions: true,
          categoryBudgets: true,
        },
      },
    },
  });
}

export async function updateCategoryStatus(userId, id, { isActive }) {
  const existing = await prisma.category.findFirst({
    where: { id, userId },
  });
  if (!existing) {
    throw new AppError('Category not found.', 404);
  }

  return prisma.category.update({
    where: { id },
    data: { isActive },
    include: {
      _count: {
        select: {
          transactions: true,
          categoryBudgets: true,
        },
      },
    },
  });
}

export async function deleteCategory(userId, id) {
  const existing = await prisma.category.findFirst({
    where: { id, userId },
    include: {
      _count: {
        select: {
          transactions: true,
          categoryBudgets: true,
        },
      },
    },
  });

  if (!existing) {
    throw new AppError('Category not found.', 404);
  }

  if (existing._count.transactions > 0 || existing._count.categoryBudgets > 0) {
    throw new AppError(
      'This category is referenced by existing transactions or budgets. Archive it instead to preserve historical records.',
      409
    );
  }

  await prisma.category.delete({ where: { id } });
  return { id };
}
