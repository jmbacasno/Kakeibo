import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "server/.env") });
dotenv.config();

function resolveDatabaseUrl(): string {
  const configured = process.env.DATABASE_URL;
  if (!configured || configured === "file:./dev.db" || !configured.startsWith("file:")) {
    const resolved = `file:${path.resolve(process.cwd(), "server/infrastructure/database/prisma/dev.db")}`;
    process.env.DATABASE_URL = resolved;
    return resolved;
  }
  return configured;
}

const databaseUrl = resolveDatabaseUrl();

export const settings = {
  // Hardcoded to port 3000 as required by the preview runtime
  port: 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl,
  jwtSecret: process.env.JWT_SECRET || "kakeibo_dev_secret_change_in_production",
  jwtAlgorithm: (process.env.JWT_ALGORITHM || "HS256") as string,
  jwtExpiresMinutes: parseInt(process.env.JWT_EXPIRES_MINUTES || "10080", 10), // 7 days default
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10),
  logLevel: process.env.LOG_LEVEL || "info",
  logFormat: process.env.LOG_FORMAT || "pretty",
  corsOrigin: process.env.CORS_ORIGIN || "*",
};
