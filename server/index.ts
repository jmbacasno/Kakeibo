import cookieParser from "cookie-parser";
import express from "express";
import "express-async-errors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { settings } from "./infrastructure/config.js";
import { prisma } from "./infrastructure/database/prisma/client.js";
import authRoutes from "./presentation/api/v1/auth.js";
import categoryRoutes from "./presentation/api/v1/categories.js";
import dashboardRoutes from "./presentation/api/v1/dashboard.js";
import noteRoutes from "./presentation/api/v1/notes.js";
import planRoutes from "./presentation/api/v1/plans.js";
import reflectionRoutes from "./presentation/api/v1/reflections.js";
import settingsRoutes from "./presentation/api/v1/settings.js";
import transactionRoutes from "./presentation/api/v1/transactions.js";
import { logger } from "./presentation/dependencies.js";
import { parseUserSession } from "./presentation/middlewares/auth.js";
import { corsMiddleware } from "./presentation/middlewares/cors.js";
import { globalErrorHandler } from "./presentation/middlewares/errors.js";
import { accessLoggerMiddleware, traceIdMiddleware } from "./presentation/middlewares/observability.js";
import { securityHeadersMiddleware } from "./presentation/middlewares/security.js";
import { setupSwagger } from "./presentation/swagger.js";

export function createApp() {
  const app = express();

  app.use(corsMiddleware);
  app.use(securityHeadersMiddleware);
  app.use(traceIdMiddleware);
  app.use(accessLoggerMiddleware);

  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(parseUserSession);

  app.get("/api/v1/health", (_req, res) => {
    res.json({
      success: true,
      data: {
        status: "ok",
        service: "kakeibo-api",
        timestamp: new Date().toISOString(),
      },
    });
  });

  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/categories", categoryRoutes);
  app.use("/api/v1/plans", planRoutes);
  app.use("/api/v1/transactions", transactionRoutes);
  app.use("/api/v1/notes", noteRoutes);
  app.use("/api/v1/monthly-reflections", reflectionRoutes);
  app.use("/api/v1/dashboard", dashboardRoutes);
  app.use("/api/v1/settings", settingsRoutes);

  setupSwagger(app);

  app.use("/api", (_req, res) => {
    res.status(404).json({
      success: false,
      code: "NOT_FOUND",
      message: "API endpoint not found.",
      error: "API endpoint not found.",
    });
  });

  app.use(globalErrorHandler);

  return app;
}

async function mountServer() {
  const app = createApp();
  const PORT = settings.port;

  if (settings.nodeEnv !== "production") {
    logger.info("Initializing Vite development middleware server...");
    const vite = await createViteServer({
      root: path.resolve(process.cwd(), "client"),
      configFile: path.resolve(process.cwd(), "client/vite.config.ts"),
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    logger.info("Initializing static distribution server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Kakeibo server listening on http://0.0.0.0:${PORT}`);
  });

  const handleShutdown = async (signal: string) => {
    logger.warn(`Received ${signal}. Starting graceful shutdown...`);
    server.close(async () => {
      try {
        await prisma.$disconnect();
        logger.info("Graceful shutdown completed.");
        process.exit(0);
      } catch (err) {
        logger.error("Failed to disconnect Prisma client during shutdown:", err);
        process.exit(1);
      }
    });

    setTimeout(() => {
      logger.error("Graceful shutdown timed out. Exiting forcefully.");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGINT", () => handleShutdown("SIGINT"));
  process.on("SIGTERM", () => handleShutdown("SIGTERM"));
}

function isMainModule(): boolean {
  const entryPath = process.argv[1];
  if (!entryPath) return false;
  const currentPath = fileURLToPath(import.meta.url);
  try {
    return fs.realpathSync(entryPath) === fs.realpathSync(currentPath);
  } catch {
    return path.resolve(entryPath) === path.resolve(currentPath);
  }
}

if (isMainModule()) {
  mountServer().catch((err) => {
    logger.error("Bootstrapping server failed:", err);
    process.exit(1);
  });
}
