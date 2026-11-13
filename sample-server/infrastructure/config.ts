import dotenv from "dotenv";

dotenv.config();

export const settings = {
  // Hardcoded to port 3000 as required by the AI Studio preview reverse proxy infrastructure
  port: 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "default_super_secret_jwt_key_please_change",
  jwtAlgorithm: (process.env.JWT_ALGORITHM || "HS256") as string,
  jwtExpiresMinutes: parseInt(process.env.JWT_EXPIRES_MINUTES || "43200", 10),
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10),
  logLevel: process.env.LOG_LEVEL || "info",
  logFormat: process.env.LOG_FORMAT || "pretty",
};
