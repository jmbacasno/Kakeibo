import { Express } from "express";
import swaggerUi from "swagger-ui-express";

const openApiSchema = {
  openapi: "3.0.0",
  info: {
    title: "Kakeibo Personal Finance API",
    version: "1.0.0",
    description:
      "RESTful API for the Kakeibo personal finance application: authentication, monthly planning, category budgets, transactions, journal notes, monthly reflections, and dashboard analytics.",
  },
  servers: [
    {
      url: "/api/v1",
      description: "Primary versioned API base path",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT Bearer token passed in Authorization header.",
      },
      CookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "kakeibo_token",
        description: "HTTP-only cookie containing JWT session token.",
      },
    },
  },
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        tags: ["System"],
        responses: {
          200: { description: "Server is healthy" },
        },
      },
    },
    "/auth/register": {
      post: {
        summary: "Register a new user and seed 9 default Kakeibo categories",
        tags: ["Auth"],
        responses: {
          201: { description: "User registered and authenticated" },
          409: { description: "Email already exists" },
        },
      },
    },
    "/auth/login": {
      post: {
        summary: "Sign in with email or username and password",
        tags: ["Auth"],
        responses: {
          200: { description: "Signed in successfully" },
          401: { description: "Invalid credentials" },
        },
      },
    },
    "/auth/logout": {
      post: {
        summary: "Sign out and clear session cookie",
        tags: ["Auth"],
        responses: { 200: { description: "Logged out" } },
      },
    },
    "/auth/me": {
      get: {
        summary: "Get authenticated user profile",
        tags: ["Auth"],
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        responses: { 200: { description: "Authenticated user profile" } },
      },
    },
    "/dashboard": {
      get: {
        summary: "Fetch aggregated monthly dashboard metrics, breakdown, and recent transactions",
        tags: ["Dashboard"],
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        responses: { 200: { description: "Dashboard summary payload" } },
      },
    },
    "/plans": {
      get: {
        summary: "List all monthly plans for authenticated user",
        tags: ["Plans"],
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        responses: { 200: { description: "Monthly plans list" } },
      },
      post: {
        summary: "Create a monthly plan (one per user/month/year)",
        tags: ["Plans"],
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        responses: { 201: { description: "Monthly plan created" } },
      },
    },
    "/plans/current": {
      get: {
        summary: "Get plan for specified or current month/year",
        tags: ["Plans"],
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        responses: { 200: { description: "Monthly plan or null" } },
      },
    },
    "/plans/{id}": {
      get: {
        summary: "Get monthly plan by ID",
        tags: ["Plans"],
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        responses: { 200: { description: "Monthly plan details" } },
      },
      put: {
        summary: "Update monthly plan and budgets",
        tags: ["Plans"],
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        responses: { 200: { description: "Updated monthly plan" } },
      },
    },
    "/plans/{id}/budgets": {
      get: {
        summary: "List category budgets for a monthly plan",
        tags: ["Budgets"],
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        responses: { 200: { description: "Category budgets list" } },
      },
      put: {
        summary: "Bulk upsert category budgets for a monthly plan",
        tags: ["Budgets"],
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        responses: { 200: { description: "Updated plan with budgets" } },
      },
    },
    "/categories": {
      get: {
        summary: "List user categories with optional type and isActive filters",
        tags: ["Categories"],
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        responses: { 200: { description: "Categories list" } },
      },
      post: {
        summary: "Create custom income or expense category",
        tags: ["Categories"],
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        responses: { 201: { description: "Created category" } },
      },
    },
    "/transactions": {
      get: {
        summary: "List paginated, filtered, and sorted transactions",
        tags: ["Transactions"],
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        responses: { 200: { description: "Paginated transactions" } },
      },
      post: {
        summary: "Record income or expense transaction (type derived from category)",
        tags: ["Transactions"],
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        responses: { 201: { description: "Created transaction" } },
      },
    },
    "/notes": {
      get: {
        summary: "List personal journal notes",
        tags: ["Notes"],
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        responses: { 200: { description: "Notes list" } },
      },
      post: {
        summary: "Create a personal note linked to a monthly plan",
        tags: ["Notes"],
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        responses: { 201: { description: "Created note" } },
      },
    },
    "/monthly-reflections": {
      get: {
        summary: "List monthly reflections",
        tags: ["Reflections"],
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        responses: { 200: { description: "Reflections list" } },
      },
      post: {
        summary: "Create month-end reflection (one per monthly plan)",
        tags: ["Reflections"],
        security: [{ BearerAuth: [] }, { CookieAuth: [] }],
        responses: { 201: { description: "Created reflection" } },
      },
    },
  },
};

export function setupSwagger(app: Express): void {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiSchema, {
      customSiteTitle: "Kakeibo API Documentation",
    })
  );
}
