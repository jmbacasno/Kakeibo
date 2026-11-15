import { Express, Router } from "express";
import authRoutes from "./api/v1/auth.js";
import categoryRoutes from "./api/v1/categories.js";
import dashboardRoutes from "./api/v1/dashboard.js";
import noteRoutes from "./api/v1/notes.js";
import planRoutes from "./api/v1/plans.js";
import reflectionRoutes from "./api/v1/reflections.js";
import settingsRoutes from "./api/v1/settings.js";
import transactionRoutes from "./api/v1/transactions.js";
import { setupSwagger } from "./swagger.js";

const v1Router = Router();

v1Router.get("/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      service: "kakeibo-api",
      timestamp: new Date().toISOString(),
    },
  });
});

v1Router.use("/auth", authRoutes);
v1Router.use("/categories", categoryRoutes);
v1Router.use("/plans", planRoutes);
v1Router.use("/transactions", transactionRoutes);
v1Router.use("/notes", noteRoutes);
v1Router.use("/monthly-reflections", reflectionRoutes);
v1Router.use("/dashboard", dashboardRoutes);
v1Router.use("/settings", settingsRoutes);

export function registerRoutes(app: Express): void {
  app.use("/api/v1", v1Router);

  setupSwagger(app);

  app.use("/api", (_req, res) => {
    res.status(404).json({
      success: false,
      code: "NOT_FOUND",
      message: "API endpoint not found.",
      error: "API endpoint not found.",
    });
  });
}
