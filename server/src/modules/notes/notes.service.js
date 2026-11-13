import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';

export async function listNotes(userId, query = {}) {
  const where = {
    monthlyPlan: {
      userId,
      ...(query.month ? { month: query.month } : {}),
      ...(query.year ? { year: query.year } : {}),
    },
    ...(query.planId ? { monthlyPlanId: query.planId } : {}),
  };

  return prisma.note.findMany({
    where,
    include: {
      monthlyPlan: { select: { id: true, month: true, year: true } },
    },
    orderBy: [{ createdAt: query.order || 'asc' }, { id: query.order || 'asc' }],
  });
}

export async function getNoteById(userId, id) {
  const note = await prisma.note.findFirst({
    where: {
      id,
      monthlyPlan: { userId },
    },
    include: {
      monthlyPlan: { select: { id: true, month: true, year: true } },
    },
  });

  if (!note) {
    throw new AppError('Note not found.', 404);
  }
  return note;
}

export async function createNote(userId, data) {
  const plan = await prisma.monthlyPlan.findFirst({
    where: { id: data.monthlyPlanId, userId },
  });
  if (!plan) {
    throw new AppError('Monthly plan not found.', 404);
  }

  return prisma.note.create({
    data: {
      monthlyPlanId: plan.id,
      title: data.title || null,
      content: data.content,
    },
    include: {
      monthlyPlan: { select: { id: true, month: true, year: true } },
    },
  });
}

export async function updateNote(userId, id, data) {
  const existing = await prisma.note.findFirst({
    where: { id, monthlyPlan: { userId } },
  });
  if (!existing) {
    throw new AppError('Note not found.', 404);
  }

  return prisma.note.update({
    where: { id },
    data: {
      title: data.title !== undefined ? data.title || null : existing.title,
      content: data.content,
    },
    include: {
      monthlyPlan: { select: { id: true, month: true, year: true } },
    },
  });
}

export async function deleteNote(userId, id) {
  const existing = await prisma.note.findFirst({
    where: { id, monthlyPlan: { userId } },
  });
  if (!existing) {
    throw new AppError('Note not found.', 404);
  }

  await prisma.note.delete({ where: { id } });
  return { id };
}
