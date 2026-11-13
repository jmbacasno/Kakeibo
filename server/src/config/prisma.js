import { PrismaClient } from '@prisma/client';
import './env.js';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.__kakeiboPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__kakeiboPrisma = prisma;
}
