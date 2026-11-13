import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';

export async function listReflections(userId, query = {}) {
  const where = {
    monthlyPlan: {
      userId,
      ...(query.month ? { month: query.month } : {}),
      ...(query.year ? { year: query.year } : {}),
    },
    ...(query.planId ? { monthlyPlanId: query.planId } : {}),
  };

  return prisma.monthlyReflection.findMany({
    where,
    include: {
      monthlyPlan: { select: { id: true, month: true, year: true, status: true } },
    },
    orderBy: [
      { monthlyPlan: { year: 'desc' } },
      { monthlyPlan: { month: 'desc' } },
    ],
  });
}

export async function getReflectionById(userId, id) {
  const reflection = await prisma.monthlyReflection.findFirst({
    where: {
      id,
      monthlyPlan: { userId },
    },
    include: {
      monthlyPlan: { select: { id: true, month: true, year: true, status: true } },
    },
  });

  if (!reflection) {
    throw new AppError('Monthly reflection not found.', 404);
  }
  return reflection;
}

export async function createReflection(userId, data) {
  const plan = await prisma.monthlyPlan.findFirst({
    where: { id: data.monthlyPlanId, userId },
  });
  if (!plan) {
    throw new AppError('Monthly plan not found.', 404);
  }

  const existing = await prisma.monthlyReflection.findUnique({
    where: { monthlyPlanId: plan.id },
  });
  if (existing) {
    throw new AppError('A reflection already exists for this monthly plan.', 409);
  }

  return prisma.monthlyReflection.create({
    data: {
      monthlyPlanId: plan.id,
      content: data.content,
    },
    include: {
      monthlyPlan: { select: { id: true, month: true, year: true, status: true } },
    },
  });
}

export async function updateReflection(userId, id, data) {
  const existing = await prisma.monthlyReflection.findFirst({
    where: { id, monthlyPlan: { userId } },
  });
  if (!existing) {
    throw new AppError('Monthly reflection not found.', 404);
  }

  return prisma.monthlyReflection.update({
    where: { id },
    data: { content: data.content },
    include: {
      monthlyPlan: { select: { id: true, month: true, year: true, status: true } },
    },
  });
}

export async function deleteReflection(userId, id) {
  const existing = await prisma.monthlyReflection.findFirst({
    where: { id, monthlyPlan: { userId } },
  });
  if (!existing) {
    throw new AppError('Monthly reflection not found.', 404);
  }

  await prisma.monthlyReflection.delete({ where: { id } });
  return { id };
}
