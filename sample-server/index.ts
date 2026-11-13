import express from "express";
import "express-async-errors";
import path from "path";
import { createServer as createViteServer } from "vite";
import { settings } from "./infrastructure/config.js";
import { parseUserSession } from "./presentation/api/v1/users.js";
import { globalErrorHandler } from "./presentation/middlewares/errors.js";
import { corsMiddleware } from "./presentation/middlewares/cors.js";
import { securityHeadersMiddleware } from "./presentation/middlewares/security.js";
import { traceIdMiddleware, accessLoggerMiddleware } from "./presentation/middlewares/observability.js";
import { logger } from "./presentation/dependencies.js";
import { prisma } from "./infrastructure/persistence/clients/prisma.js";

// Import Presentation routes
import authRoutes from "./presentation/api/v1/auth.js";
import userRoutes from "./presentation/api/v1/users.js";
import categoryRoutes from "./presentation/api/v1/categories.js";
import taskRoutes from "./presentation/api/v1/tasks.js";
import perfectDayRoutes from "./presentation/api/v1/perfectDays.js";
import { setupSwagger } from "./presentation/swagger.js";

const app = express();
const PORT = settings.port;

// Apply CORS policy before routing or parsing
app.use(corsMiddleware);

// Apply security headers
app.use(securityHeadersMiddleware);

// Initialize tracing context and access logs before other handlers
app.use(traceIdMiddleware);
app.use(accessLoggerMiddleware);

app.use(express.json());

// Session extraction parser middleware
app.use(parseUserSession);

// Mount Modular Routing directly under /api/v1 for versioning, while maintaining legacy /api routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/perfect-days", perfectDayRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/perfect-days", perfectDayRoutes);

// Setup Swagger UI documentation route
setupSwagger(app);

// Global presentation error handler
app.use(globalErrorHandler);

// Serve app views using Vite dev integration OR static compilation bundles
async function mountServer() {
  if (settings.nodeEnv !== "production") {
    logger.info("Initializing Vite development middleware server...");
    const vite = await createViteServer({
      root: path.join(process.cwd(), "client"),
      configFile: path.resolve(process.cwd(), "vite.config.ts"),
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    logger.info("Initializing static distribution server on production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Server successfully started, listening securely on http://localhost:${PORT}`);
  });

  // Graceful shutdown hooks
  const handleShutdown = async (signal: string) => {
    logger.warn(`Received ${signal}. Starting graceful shutdown of full-stack server...`);
    
    server.close(async () => {
      logger.info("HTTP server closed completely.");
      try {
        logger.info("Disconnecting database instances and storage components...");
        await prisma.$disconnect();
        logger.info("Graceful shutdown completed successfully. Exiting process.");
        process.exit(0);
      } catch (err) {
        logger.error("Failed to disconnect database connections gracefully during shutdown:", err);
        process.exit(1);
      }
    });

    // Timeout fallback after 10 seconds
    setTimeout(() => {
      logger.error("Graceful shutdown timed out. Forcing process exit!");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGINT", () => handleShutdown("SIGINT"));
  process.on("SIGTERM", () => handleShutdown("SIGTERM"));
}

mountServer().catch((err) => {
  logger.error("Bootstrapping server failed irreversibly:", err);
});
