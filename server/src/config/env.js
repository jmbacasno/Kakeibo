import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../../..');
const defaultDbPath = path.resolve(rootDir, 'server/prisma/dev.db');

dotenv.config({ path: path.resolve(rootDir, '.env') });

if (!process.env.DATABASE_URL || process.env.DATABASE_URL === 'file:./dev.db') {
  process.env.DATABASE_URL = `file:${defaultDbPath}`;
}

export const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'kakeibo-dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};
