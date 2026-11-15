import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { z } from "zod";
import {
  bulkUpdateBudgetsSchema,
  singleBudgetSchema,
} from "../application/dtos/categoryBudgetDTO.js";
import {
  createCategorySchema,
  listCategoriesQuerySchema,
  updateCategorySchema,
  updateCategoryStatusSchema,
} from "../application/dtos/categoryDTO.js";
import { dashboardQuerySchema } from "../application/dtos/dashboardDTO.js";
import {
  createPlanSchema,
  currentPlanQuerySchema,
  updatePlanSchema,
  updatePlanStatusSchema,
} from "../application/dtos/monthlyPlanDTO.js";
import {
  createReflectionSchema,
  listReflectionsQuerySchema,
  updateReflectionSchema,
} from "../application/dtos/monthlyReflectionDTO.js";
import {
  createNoteSchema,
  listNotesQuerySchema,
  updateNoteSchema,
} from "../application/dtos/noteDTO.js";
import {
  createTransactionSchema,
  listTransactionsQuerySchema,
  updateTransactionSchema,
} from "../application/dtos/transactionDTO.js";
import { loginSchema, registerSchema } from "../application/dtos/userDTO.js";
import { updateUserSettingsSchema } from "../application/dtos/userSettingsDTO.js";
import {
  SUPPORTED_CURRENCIES,
  SUPPORTED_DATE_FORMATS,
  SUPPORTED_LANGUAGES,
  SUPPORTED_THEMES,
} from "../domain/entities/userSettings/validators.js";

type OpenApiSchemaObject = Record<string, unknown>;

function zodToOpenApiSchema(
  schema: z.ZodTypeAny,
  propertyOverrides?: Record<string, OpenApiSchemaObject>,
  example?: Record<string, unknown>
): OpenApiSchemaObject {
  const jsonSchema = z.toJSONSchema(schema, {
    target: "openapi-3.0",
    io: "input",
    unrepresentable: "any",
  }) as OpenApiSchemaObject;

  delete jsonSchema.$schema;

  if (propertyOverrides && jsonSchema.properties && typeof jsonSchema.properties === "object") {
    const props = jsonSchema.properties as Record<string, OpenApiSchemaObject>;
    for (const [key, override] of Object.entries(propertyOverrides)) {
      props[key] = {
        ...(props[key] ?? {}),
        ...override,
      };
    }
  }

  if (example) {
    jsonSchema.example = example;
  }

  return jsonSchema;
}

function zodQueryToParameters(
  schema: z.ZodTypeAny,
  descriptions?: Record<string, string>,
  propertyOverrides?: Record<string, OpenApiSchemaObject>
) {
  const jsonSchema = zodToOpenApiSchema(schema, propertyOverrides);
  const properties = (jsonSchema.properties ?? {}) as Record<string, OpenApiSchemaObject>;
  const requiredSet = new Set(
    Array.isArray(jsonSchema.required) ? (jsonSchema.required as string[]) : []
  );

  return Object.entries(properties).map(([name, propSchema]) => ({
    name,
    in: "query",
    required: requiredSet.has(name),
    schema: propSchema,
    ...(descriptions?.[name] ? { description: descriptions[name] } : {}),
  }));
}

function refSchema(name: string): OpenApiSchemaObject {
  return { $ref: `#/components/schemas/${name}` };
}

function successEnvelope(dataSchema: OpenApiSchemaObject, description: string) {
  return {
    description,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: dataSchema,
          },
          required: ["success", "data"],
        },
      },
    },
  };
}

function jsonRequestBody(schemaName: string, description?: string) {
  return {
    required: true,
    ...(description ? { description } : {}),
    content: {
      "application/json": {
        schema: refSchema(schemaName),
      },
    },
  };
}

const authSecurity = [{ BearerAuth: [] }, { CookieAuth: [] }];

const idPathParam = { $ref: "#/components/parameters/IdParam" };
const categoryIdPathParam = { $ref: "#/components/parameters/CategoryIdParam" };

const validationErrorRef = { $ref: "#/components/responses/ValidationError" };
const unauthorizedErrorRef = { $ref: "#/components/responses/UnauthorizedError" };
const notFoundErrorRef = { $ref: "#/components/responses/NotFoundError" };
const conflictErrorRef = { $ref: "#/components/responses/ConflictError" };

const dateFieldSchema: OpenApiSchemaObject = {
  type: "string",
  format: "date",
  description: "Date in YYYY-MM-DD format (or ISO-8601 timestamp).",
  example: "2026-11-15",
};

const openApiSchema = {
  openapi: "3.0.0",
  info: {
    title: "Kakeibo Personal Finance API",
    version: "1.0.0",
    description:
      "RESTful API for the Kakeibo personal finance application: authentication, monthly planning, category budgets, transactions, journal notes, monthly reflections, dashboard analytics, and user settings.",
  },
  servers: [
    {
      url: "/api/v1",
      description: "Primary versioned API base path",
    },
  ],
  tags: [
    { name: "System", description: "Service health and diagnostics" },
    { name: "Auth", description: "Registration, authentication, and current session" },
    { name: "Dashboard", description: "Aggregated monthly overview and financial analytics" },
    { name: "Plans", description: "Monthly income plans, savings goals, and summaries" },
    { name: "Budgets", description: "Category budget allocations within a monthly plan" },
    { name: "Categories", description: "Income and expense categories" },
    { name: "Transactions", description: "Income and expense ledger entries" },
    { name: "Notes", description: "Personal financial journal notes linked to monthly plans" },
    { name: "Reflections", description: "Month-end Kakeibo reflections" },
    { name: "Settings", description: "User display, currency, locale, and theme preferences" },
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
    parameters: {
      IdParam: {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "integer", minimum: 1 },
        description: "Positive integer resource identifier",
      },
      CategoryIdParam: {
        name: "categoryId",
        in: "path",
        required: true,
        schema: { type: "integer", minimum: 1 },
        description: "Positive integer category identifier",
      },
    },
    responses: {
      ValidationError: {
        description: "Validation failed or malformed request input",
        content: {
          "application/json": {
            schema: refSchema("ApiError"),
          },
        },
      },
      UnauthorizedError: {
        description: "Authentication required or invalid credentials",
        content: {
          "application/json": {
            schema: refSchema("ApiError"),
          },
        },
      },
      NotFoundError: {
        description: "Requested resource was not found",
        content: {
          "application/json": {
            schema: refSchema("ApiError"),
          },
        },
      },
      ConflictError: {
        description: "Resource conflict (e.g., duplicate record or in-use reference)",
        content: {
          "application/json": {
            schema: refSchema("ApiError"),
          },
        },
      },
    },
    schemas: {
      // --- Input DTO Schemas (derived directly from application Zod schemas) ---
      RegisterInput: zodToOpenApiSchema(registerSchema, undefined, {
        name: "Haruki Tanaka",
        email: "haruki@example.com",
        password: "strongpassword123",
      }),
      LoginInput: zodToOpenApiSchema(loginSchema, undefined, {
        email: "admin",
        password: "admin",
      }),
      CreatePlanInput: zodToOpenApiSchema(createPlanSchema, undefined, {
        month: 11,
        year: 2026,
        plannedIncome: 4500,
        savingsGoal: 900,
        status: "ACTIVE",
        budgets: [{ categoryId: 1, allocatedAmount: 1200 }],
      }),
      UpdatePlanInput: zodToOpenApiSchema(updatePlanSchema, undefined, {
        plannedIncome: 4800,
        savingsGoal: 1000,
        status: "ACTIVE",
      }),
      UpdatePlanStatusInput: zodToOpenApiSchema(updatePlanStatusSchema, undefined, {
        status: "COMPLETED",
      }),
      BulkUpdateBudgetsInput: zodToOpenApiSchema(bulkUpdateBudgetsSchema, undefined, {
        budgets: [
          { categoryId: 1, allocatedAmount: 1200 },
          { categoryId: 2, allocatedAmount: 450 },
        ],
      }),
      SingleBudgetInput: zodToOpenApiSchema(singleBudgetSchema, undefined, {
        allocatedAmount: 500,
      }),
      CreateCategoryInput: zodToOpenApiSchema(createCategorySchema, undefined, {
        name: "Coffee & Tea",
        type: "EXPENSE",
      }),
      UpdateCategoryInput: zodToOpenApiSchema(updateCategorySchema, undefined, {
        name: "Cafes & Matcha",
      }),
      UpdateCategoryStatusInput: zodToOpenApiSchema(updateCategoryStatusSchema, undefined, {
        isActive: false,
      }),
      CreateTransactionInput: zodToOpenApiSchema(
        createTransactionSchema,
        {
          transactionDate: {
            ...dateFieldSchema,
            description:
              "Transaction date (YYYY-MM-DD or ISO-8601). Must belong to the selected monthly plan's month and year.",
          },
        },
        {
          monthlyPlanId: 1,
          categoryId: 2,
          amount: 42.5,
          description: "Weekly neighborhood market groceries",
          transactionDate: "2026-11-15",
        }
      ),
      UpdateTransactionInput: zodToOpenApiSchema(
        updateTransactionSchema,
        {
          transactionDate: {
            ...dateFieldSchema,
            description:
              "Updated transaction date (YYYY-MM-DD or ISO-8601). Must belong to the monthly plan's month and year.",
          },
        },
        {
          amount: 48.0,
          description: "Neighborhood market groceries + fruit",
          transactionDate: "2026-11-15",
        }
      ),
      CreateNoteInput: zodToOpenApiSchema(createNoteSchema, undefined, {
        monthlyPlanId: 1,
        title: "Mid-month check-in",
        content: "Cooked at home 5 nights this week and stayed comfortably under grocery budget.",
      }),
      UpdateNoteInput: zodToOpenApiSchema(updateNoteSchema, undefined, {
        title: "Updated mid-month check-in",
        content: "Kept discretionary dining under $100 for the first half of the month.",
      }),
      CreateReflectionInput: zodToOpenApiSchema(createReflectionSchema, undefined, {
        monthlyPlanId: 1,
        content:
          "Met the savings goal by automating transfers right after payday. Next month, reduce impulse subscriptions.",
      }),
      UpdateReflectionInput: zodToOpenApiSchema(updateReflectionSchema, undefined, {
        content:
          "Met the savings goal and trimmed dining out by 15%. Plan to carry this envelope split into next month.",
      }),
      UpdateUserSettingsInput: zodToOpenApiSchema(
        updateUserSettingsSchema,
        {
          currency: {
            type: "string",
            enum: [...SUPPORTED_CURRENCIES],
            description: "Preferred display currency code.",
          },
          language: {
            type: "string",
            enum: [...SUPPORTED_LANGUAGES],
            description: "Preferred UI language code.",
          },
          theme: {
            type: "string",
            enum: [...SUPPORTED_THEMES],
            description: "UI appearance preference.",
          },
          dateFormat: {
            type: "string",
            enum: [...SUPPORTED_DATE_FORMATS],
            description: "Preferred client date formatting pattern.",
          },
          firstDayOfWeek: {
            type: "integer",
            enum: [0, 1],
            description: "0 = Sunday, 1 = Monday.",
          },
        },
        {
          currency: "USD",
          language: "en",
          theme: "system",
          dateFormat: "MMM D, YYYY",
          firstDayOfWeek: 1,
        }
      ),

      // --- Response & Entity Schemas ---
      ApiError: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          code: { type: "string", example: "VALIDATION_FAILED" },
          message: { type: "string", example: "Validation failed." },
          error: { type: "string", example: "Validation failed." },
          details: { nullable: true },
        },
        required: ["success", "code", "message", "error"],
      },
      MessageData: {
        type: "object",
        properties: {
          message: { type: "string", example: "Operation completed." },
        },
        required: ["message"],
      },
      HealthData: {
        type: "object",
        properties: {
          status: { type: "string", example: "ok" },
          service: { type: "string", example: "kakeibo-api" },
          timestamp: { type: "string", format: "date-time" },
        },
        required: ["status", "service", "timestamp"],
      },
      User: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Administrator" },
          email: { type: "string", example: "admin" },
          createdAt: { type: "string", format: "date-time", nullable: true },
          updatedAt: { type: "string", format: "date-time", nullable: true },
        },
        required: ["id", "name", "email", "createdAt", "updatedAt"],
      },
      AuthSession: {
        type: "object",
        properties: {
          user: refSchema("User"),
          token: { type: "string", description: "Signed JWT access token" },
        },
        required: ["user", "token"],
      },
      Category: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          userId: { type: "integer", example: 1 },
          name: { type: "string", example: "Groceries & Household" },
          type: { type: "string", enum: ["INCOME", "EXPENSE"] },
          isDefault: { type: "boolean", example: true },
          isActive: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time", nullable: true },
          updatedAt: { type: "string", format: "date-time", nullable: true },
          _count: {
            type: "object",
            properties: {
              transactions: { type: "integer", example: 4 },
              categoryBudgets: { type: "integer", example: 1 },
            },
          },
        },
        required: ["id", "userId", "name", "type", "isDefault", "isActive", "createdAt", "updatedAt"],
      },
      PlanSummaryRef: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          month: { type: "integer", example: 11 },
          year: { type: "integer", example: 2026 },
        },
        required: ["id", "month", "year"],
      },
      ReflectionPlanSummaryRef: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          month: { type: "integer", example: 11 },
          year: { type: "integer", example: 2026 },
          status: { type: "string", enum: ["DRAFT", "ACTIVE", "COMPLETED"] },
        },
        required: ["id", "month", "year", "status"],
      },
      CategoryBreakdownItem: {
        type: "object",
        properties: {
          categoryId: { type: "integer" },
          categoryName: { type: "string" },
          isDefault: { type: "boolean" },
          isActive: { type: "boolean" },
          allocatedAmount: { type: "number" },
          actualSpent: { type: "number" },
          remainingBudget: { type: "number" },
          utilizationPercent: { type: "number" },
          isOverBudget: { type: "boolean" },
          hasZeroAllocation: { type: "boolean" },
        },
        required: [
          "categoryId",
          "categoryName",
          "isDefault",
          "isActive",
          "allocatedAmount",
          "actualSpent",
          "remainingBudget",
          "utilizationPercent",
          "isOverBudget",
          "hasZeroAllocation",
        ],
      },
      PlanSummary: {
        type: "object",
        properties: {
          plannedIncome: { type: "number", example: 4500 },
          actualIncome: { type: "number", example: 4500 },
          savingsGoal: { type: "number", example: 900 },
          actualSavings: { type: "number", example: 1150 },
          savingsProgressPercent: { type: "number", example: 127.8 },
          plannedAvailableExpenses: { type: "number", example: 3600 },
          totalAllocatedBudget: { type: "number", example: 3400 },
          totalExpenses: { type: "number", example: 3350 },
          remainingBudget: { type: "number", example: 50 },
          allocationDifference: { type: "number", example: -200 },
          allocationExceedsAvailable: { type: "boolean", example: false },
          overallUtilizationPercent: { type: "number", example: 98.5 },
          categoryBreakdown: {
            type: "array",
            items: refSchema("CategoryBreakdownItem"),
          },
          overBudgetCategories: {
            type: "array",
            items: refSchema("CategoryBreakdownItem"),
          },
        },
        required: [
          "plannedIncome",
          "actualIncome",
          "savingsGoal",
          "actualSavings",
          "savingsProgressPercent",
          "plannedAvailableExpenses",
          "totalAllocatedBudget",
          "totalExpenses",
          "remainingBudget",
          "allocationDifference",
          "allocationExceedsAvailable",
          "overallUtilizationPercent",
          "categoryBreakdown",
          "overBudgetCategories",
        ],
      },
      PlanBudgetItem: {
        type: "object",
        properties: {
          id: { type: "integer" },
          monthlyPlanId: { type: "integer" },
          categoryId: { type: "integer" },
          allocatedAmount: { type: "number" },
          category: { allOf: [refSchema("Category")], nullable: true },
        },
        required: ["id", "monthlyPlanId", "categoryId", "allocatedAmount", "category"],
      },
      CategoryBudget: {
        type: "object",
        properties: {
          id: { type: "integer" },
          monthlyPlanId: { type: "integer" },
          categoryId: { type: "integer" },
          allocatedAmount: { type: "number" },
          createdAt: { type: "string", format: "date-time", nullable: true },
          updatedAt: { type: "string", format: "date-time", nullable: true },
          category: { allOf: [refSchema("Category")], nullable: true },
        },
        required: [
          "id",
          "monthlyPlanId",
          "categoryId",
          "allocatedAmount",
          "createdAt",
          "updatedAt",
          "category",
        ],
      },
      MonthlyPlan: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          userId: { type: "integer", example: 1 },
          month: { type: "integer", example: 11 },
          year: { type: "integer", example: 2026 },
          plannedIncome: { type: "number", example: 4500 },
          savingsGoal: { type: "number", example: 900 },
          status: { type: "string", enum: ["DRAFT", "ACTIVE", "COMPLETED"] },
          createdAt: { type: "string", format: "date-time", nullable: true },
          updatedAt: { type: "string", format: "date-time", nullable: true },
          budgets: {
            type: "array",
            items: refSchema("PlanBudgetItem"),
          },
          summary: refSchema("PlanSummary"),
        },
        required: [
          "id",
          "userId",
          "month",
          "year",
          "plannedIncome",
          "savingsGoal",
          "status",
          "createdAt",
          "updatedAt",
          "budgets",
          "summary",
        ],
      },
      Transaction: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          monthlyPlanId: { type: "integer", example: 1 },
          categoryId: { type: "integer", example: 2 },
          type: { type: "string", enum: ["INCOME", "EXPENSE"] },
          amount: { type: "number", example: 42.5 },
          description: { type: "string", example: "Weekly neighborhood market groceries" },
          transactionDate: { type: "string", format: "date", example: "2026-11-15" },
          createdAt: { type: "string", format: "date-time", nullable: true },
          updatedAt: { type: "string", format: "date-time", nullable: true },
          category: { allOf: [refSchema("Category")], nullable: true },
          monthlyPlan: { allOf: [refSchema("PlanSummaryRef")], nullable: true },
        },
        required: [
          "id",
          "monthlyPlanId",
          "categoryId",
          "type",
          "amount",
          "description",
          "transactionDate",
          "createdAt",
          "updatedAt",
          "category",
          "monthlyPlan",
        ],
      },
      PaginationMeta: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 25 },
          total: { type: "integer", example: 42 },
          totalPages: { type: "integer", example: 2 },
        },
        required: ["page", "limit", "total", "totalPages"],
      },
      Note: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          monthlyPlanId: { type: "integer", example: 1 },
          title: { type: "string", nullable: true, example: "Mid-month check-in" },
          content: { type: "string", example: "Stayed under grocery budget this week." },
          createdAt: { type: "string", format: "date-time", nullable: true },
          updatedAt: { type: "string", format: "date-time", nullable: true },
          monthlyPlan: { allOf: [refSchema("PlanSummaryRef")], nullable: true },
        },
        required: [
          "id",
          "monthlyPlanId",
          "title",
          "content",
          "createdAt",
          "updatedAt",
          "monthlyPlan",
        ],
      },
      MonthlyReflection: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          monthlyPlanId: { type: "integer", example: 1 },
          content: { type: "string", example: "Met savings goal for November." },
          createdAt: { type: "string", format: "date-time", nullable: true },
          updatedAt: { type: "string", format: "date-time", nullable: true },
          monthlyPlan: { allOf: [refSchema("ReflectionPlanSummaryRef")], nullable: true },
          financialSummary: { allOf: [refSchema("PlanSummary")], nullable: true },
        },
        required: [
          "id",
          "monthlyPlanId",
          "content",
          "createdAt",
          "updatedAt",
          "monthlyPlan",
        ],
      },
      AvailableMonthItem: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          month: { type: "integer", example: 11 },
          year: { type: "integer", example: 2026 },
          status: { type: "string", enum: ["DRAFT", "ACTIVE", "COMPLETED"] },
        },
        required: ["id", "month", "year", "status"],
      },
      DashboardData: {
        type: "object",
        properties: {
          month: { type: "integer", example: 11 },
          year: { type: "integer", example: 2026 },
          hasPlan: { type: "boolean", example: true },
          plan: { allOf: [refSchema("MonthlyPlan")], nullable: true },
          summary: { allOf: [refSchema("PlanSummary")], nullable: true },
          recentTransactions: {
            type: "array",
            items: refSchema("Transaction"),
          },
          availableMonths: {
            type: "array",
            items: refSchema("AvailableMonthItem"),
          },
        },
        required: [
          "month",
          "year",
          "hasPlan",
          "plan",
          "summary",
          "recentTransactions",
          "availableMonths",
        ],
      },
      UserSettings: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          userId: { type: "integer", example: 1 },
          currency: { type: "string", enum: [...SUPPORTED_CURRENCIES], example: "USD" },
          language: { type: "string", enum: [...SUPPORTED_LANGUAGES], example: "en" },
          theme: { type: "string", enum: [...SUPPORTED_THEMES], example: "system" },
          dateFormat: {
            type: "string",
            enum: [...SUPPORTED_DATE_FORMATS],
            example: "MMM D, YYYY",
          },
          firstDayOfWeek: { type: "integer", enum: [0, 1], example: 1 },
          createdAt: { type: "string", format: "date-time", nullable: true },
          updatedAt: { type: "string", format: "date-time", nullable: true },
        },
        required: [
          "id",
          "userId",
          "currency",
          "language",
          "theme",
          "dateFormat",
          "firstDayOfWeek",
          "createdAt",
          "updatedAt",
        ],
      },
    },
  },
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        description: "Verify API liveness and timestamp.",
        tags: ["System"],
        responses: {
          200: successEnvelope(refSchema("HealthData"), "Server is healthy"),
        },
      },
    },
    "/auth/register": {
      post: {
        summary: "Register a new user and seed 9 default Kakeibo categories",
        tags: ["Auth"],
        requestBody: jsonRequestBody("RegisterInput"),
        responses: {
          201: successEnvelope(refSchema("AuthSession"), "User registered and authenticated"),
          400: validationErrorRef,
          409: conflictErrorRef,
        },
      },
    },
    "/auth/login": {
      post: {
        summary: "Sign in with email or username and password",
        tags: ["Auth"],
        requestBody: jsonRequestBody("LoginInput"),
        responses: {
          200: successEnvelope(refSchema("AuthSession"), "Signed in successfully"),
          400: validationErrorRef,
          401: unauthorizedErrorRef,
        },
      },
    },
    "/auth/logout": {
      post: {
        summary: "Sign out and clear session cookie",
        tags: ["Auth"],
        responses: {
          200: successEnvelope(refSchema("MessageData"), "Logged out"),
        },
      },
    },
    "/auth/me": {
      get: {
        summary: "Get authenticated user profile",
        tags: ["Auth"],
        security: authSecurity,
        responses: {
          200: successEnvelope(
            {
              type: "object",
              properties: { user: refSchema("User") },
              required: ["user"],
            },
            "Authenticated user profile"
          ),
          401: unauthorizedErrorRef,
        },
      },
    },
    "/dashboard": {
      get: {
        summary: "Fetch aggregated monthly dashboard metrics, breakdown, and recent transactions",
        tags: ["Dashboard"],
        security: authSecurity,
        parameters: zodQueryToParameters(dashboardQuerySchema, {
          month: "Target month (1-12). Defaults to current month.",
          year: "Target year (2000-2100). Defaults to current year.",
        }),
        responses: {
          200: successEnvelope(refSchema("DashboardData"), "Dashboard summary payload"),
          400: validationErrorRef,
          401: unauthorizedErrorRef,
        },
      },
    },
    "/plans": {
      get: {
        summary: "List all monthly plans for authenticated user",
        tags: ["Plans"],
        security: authSecurity,
        responses: {
          200: successEnvelope(
            {
              type: "object",
              properties: {
                plans: { type: "array", items: refSchema("MonthlyPlan") },
              },
              required: ["plans"],
            },
            "Monthly plans list"
          ),
          401: unauthorizedErrorRef,
        },
      },
      post: {
        summary: "Create a monthly plan (one per user/month/year)",
        tags: ["Plans"],
        security: authSecurity,
        requestBody: jsonRequestBody("CreatePlanInput"),
        responses: {
          201: successEnvelope(
            {
              type: "object",
              properties: { plan: refSchema("MonthlyPlan") },
              required: ["plan"],
            },
            "Monthly plan created"
          ),
          400: validationErrorRef,
          401: unauthorizedErrorRef,
          409: conflictErrorRef,
        },
      },
    },
    "/plans/current": {
      get: {
        summary: "Get plan for specified or current month/year",
        tags: ["Plans"],
        security: authSecurity,
        parameters: zodQueryToParameters(currentPlanQuerySchema, {
          month: "Target month (1-12). Defaults to current month.",
          year: "Target year (2000-2100). Defaults to current year.",
        }),
        responses: {
          200: successEnvelope(
            {
              type: "object",
              properties: {
                plan: { allOf: [refSchema("MonthlyPlan")], nullable: true },
              },
              required: ["plan"],
            },
            "Monthly plan or null"
          ),
          400: validationErrorRef,
          401: unauthorizedErrorRef,
        },
      },
    },
    "/plans/{id}": {
      get: {
        summary: "Get monthly plan by ID",
        tags: ["Plans"],
        security: authSecurity,
        parameters: [idPathParam],
        responses: {
          200: successEnvelope(
            {
              type: "object",
              properties: { plan: refSchema("MonthlyPlan") },
              required: ["plan"],
            },
            "Monthly plan details"
          ),
          400: validationErrorRef,
          401: unauthorizedErrorRef,
          404: notFoundErrorRef,
        },
      },
      put: {
        summary: "Update monthly plan and budgets",
        tags: ["Plans"],
        security: authSecurity,
        parameters: [idPathParam],
        requestBody: jsonRequestBody("UpdatePlanInput"),
        responses: {
          200: successEnvelope(
            {
              type: "object",
              properties: { plan: refSchema("MonthlyPlan") },
              required: ["plan"],
            },
            "Updated monthly plan"
          ),
          400: validationErrorRef,
          401: unauthorizedErrorRef,
          404: notFoundErrorRef,
        },
      },
    },
    "/plans/{id}/summary": {
      get: {
        summary: "Get financial summary and category breakdown for a monthly plan",
        tags: ["Plans"],
        security: authSecurity,
        parameters: [idPathParam],
        responses: {
          200: successEnvelope(
            {
              type: "object",
              properties: { summary: refSchema("PlanSummary") },
              required: ["summary"],
            },
            "Computed monthly plan summary"
          ),
          400: validationErrorRef,
          401: unauthorizedErrorRef,
          404: notFoundErrorRef,
        },
      },
    },
    "/plans/{id}/status": {
      patch: {
        summary: "Update monthly plan status (DRAFT, ACTIVE, or COMPLETED)",
        tags: ["Plans"],
        security: authSecurity,
        parameters: [idPathParam],
        requestBody: jsonRequestBody("UpdatePlanStatusInput"),
        responses: {
          200: successEnvelope(
            {
              type: "object",
              properties: { plan: refSchema("MonthlyPlan") },
              required: ["plan"],
            },
            "Updated monthly plan status"
          ),
          400: validationErrorRef,
          401: unauthorizedErrorRef,
          404: notFoundErrorRef,
        },
      },
    },
    "/plans/{id}/budgets": {
      get: {
        summary: "List category budgets for a monthly plan",
        tags: ["Budgets"],
        security: authSecurity,
        parameters: [idPathParam],
        responses: {
          200: successEnvelope(
            {
              type: "object",
              properties: {
                budgets: { type: "array", items: refSchema("CategoryBudget") },
              },
              required: ["budgets"],
            },
            "Category budgets list"
          ),
          400: validationErrorRef,
          401: unauthorizedErrorRef,
          404: notFoundErrorRef,
        },
      },
      put: {
        summary: "Bulk upsert category budgets for a monthly plan",
        tags: ["Budgets"],
        security: authSecurity,
        parameters: [idPathParam],
        requestBody: jsonRequestBody("BulkUpdateBudgetsInput"),
        responses: {
          200: successEnvelope(
            {
              type: "object",
              properties: { plan: refSchema("MonthlyPlan") },
              required: ["plan"],
            },
            "Updated plan with budgets"
          ),
          400: validationErrorRef,
          401: unauthorizedErrorRef,
          404: notFoundErrorRef,
        },
      },
    },
    "/plans/{id}/budgets/{categoryId}": {
      patch: {
        summary: "Upsert a single category budget allocation within a monthly plan",
        tags: ["Budgets"],
        security: authSecurity,
        parameters: [idPathParam, categoryIdPathParam],
        requestBody: jsonRequestBody("SingleBudgetInput"),
        responses: {
          200: successEnvelope(
            {
              type: "object",
              properties: { budget: refSchema("CategoryBudget") },
              required: ["budget"],
            },
            "Updated category budget"
          ),
          400: validationErrorRef,
          401: unauthorizedErrorRef,
          404: notFoundErrorRef,
        },
      },
    },
    "/categories": {
      get: {
        summary: "List user categories with optional type and isActive filters",
        tags: ["Categories"],
        security: authSecurity,
        parameters: zodQueryToParameters(listCategoriesQuerySchema, {
          type: "Filter by category type (INCOME or EXPENSE).",
          isActive: "Filter by active status ('true' or 'false').",
        }),
        responses: {
          200: successEnvelope(
            {
              type: "object",
              properties: {
                categories: { type: "array", items: refSchema("Category") },
              },
              required: ["categories"],
            },
            "Categories list"
          ),
          400: validationErrorRef,
          401: unauthorizedErrorRef,
        },
      },
      post: {
        summary: "Create custom income or expense category",
        tags: ["Categories"],
        security: authSecurity,
        requestBody: jsonRequestBody("CreateCategoryInput"),
        responses: {
          201: successEnvelope(
            {
              type: "object",
              properties: { category: refSchema("Category") },
              required: ["category"],
            },
            "Created category"
          ),
          400: validationErrorRef,
          401: unauthorizedErrorRef,
          409: conflictErrorRef,
        },
      },
    },
    "/categories/{id}": {
      get: {
        summary: "Get category by ID",
        tags: ["Categories"],
        security: authSecurity,
        parameters: [idPathParam],
        responses: {
          200: successEnvelope(
            {
              type: "object",
              properties: { category: refSchema("Category") },
              required: ["category"],
            },
            "Category details"
          ),
          400: validationErrorRef,
          401: unauthorizedErrorRef,
          404: notFoundErrorRef,
        },
      },
      put: {
        summary: "Rename a category",
        tags: ["Categories"],
        security: authSecurity,
        parameters: [idPathParam],
        requestBody: jsonRequestBody("UpdateCategoryInput"),
        responses: {
          200: successEnvelope(
            {
              type: "object",
              properties: { category: refSchema("Category") },
              required: ["category"],
            },
            "Updated category"
          ),
          400: validationErrorRef,
          401: unauthorizedErrorRef,
          404: notFoundErrorRef,
          409: conflictErrorRef,
        },
      },
      delete: {
        summary: "Delete a custom category (if not in use)",
        tags: ["Categories"],
        security: authSecurity,
        parameters: [idPathParam],
        responses: {
          200: successEnvelope(refSchema("MessageData"), "Category deleted"),
          400: validationErrorRef,
          401: unauthorizedErrorRef,
          404: notFoundErrorRef,
          409: conflictErrorRef,
        },
      },
    },
    "/categories/{id}/status": {
      patch: {
        summary: "Activate or deactivate a category",
        tags: ["Categories"],
        security: authSecurity,
        parameters: [idPathParam],
        requestBody: jsonRequestBody("UpdateCategoryStatusInput"),
        responses: {
          200: successEnvelope(
            {
              type: "object",
              properties: { category: refSchema("Category") },
              required: ["category"],
            },
            "Updated category status"
          ),
          400: validationErrorRef,
          401: unauthorizedErrorRef,
          404: notFoundErrorRef,
        },
      },
    },
    "/transactions": {
      get: {
        summary: "List paginated, filtered, and sorted transactions",
        tags: ["Transactions"],
        security: authSecurity,
        parameters: zodQueryToParameters(
          listTransactionsQuerySchema,
          {
            planId: "Filter by monthly plan ID.",
            categoryId: "Filter by category ID.",
            type: "Filter by category type (INCOME or EXPENSE).",
            startDate: "Inclusive lower bound for transactionDate (YYYY-MM-DD).",
            endDate: "Inclusive upper bound for transactionDate (YYYY-MM-DD).",
            search: "Case-insensitive search text in description or category name.",
            sortBy: "Sort field (date or amount).",
            sortOrder: "Sort direction (asc or desc).",
            page: "1-based page number.",
            limit: "Items per page (1-100).",
          },
          {
            startDate: { ...dateFieldSchema, description: "Filter start date (YYYY-MM-DD)." },
            endDate: { ...dateFieldSchema, description: "Filter end date (YYYY-MM-DD)." },
          }
        ),
        responses: {
          200: successEnvelope(
            {
              type: "object",
              properties: {
                transactions: { type: "array", items: refSchema("Transaction") },
                pagination: refSchema("PaginationMeta"),
              },
              required: ["transactions", "pagination"],
            },
            "Paginated transactions"
          ),
          400: validationErrorRef,
          401: unauthorizedErrorRef,
        },
      },
      post: {
        summary: "Record income or expense transaction (type derived from category)",
        tags: ["Transactions"],
        security: authSecurity,
        requestBody: jsonRequestBody("CreateTransactionInput"),
        responses: {
          201: successEnvelope(
            {
              type: "object",
              properties: { transaction: refSchema("Transaction") },
              required: ["transaction"],
            },
            "Created transaction"
          ),
          400: validationErrorRef,
          401: unauthorizedErrorRef,
          404: notFoundErrorRef,
        },
      },
    },
    "/transactions/{id}": {
      get: {
        summary: "Get transaction by ID",
        tags: ["Transactions"],
        security: authSecurity,
        parameters: [idPathParam],
        responses: {
          200: successEnvelope(
            {
              type: "object",
              properties: { transaction: refSchema("Transaction") },
              required: ["transaction"],
            },
            "Transaction details"
          ),
          400: validationErrorRef,
          401: unauthorizedErrorRef,
          404: notFoundErrorRef,
        },
      },
      put: {
        summary: "Update an existing transaction",
        tags: ["Transactions"],
        security: authSecurity,
        parameters: [idPathParam],
        requestBody: jsonRequestBody("UpdateTransactionInput"),
        responses: {
          200: successEnvelope(
            {
              type: "object",
              properties: { transaction: refSchema("Transaction") },
              required: ["transaction"],
            },
            "Updated transaction"
          ),
          400: validationErrorRef,
          401: unauthorizedErrorRef,
          404: notFoundErrorRef,
        },
      },
      delete: {
        summary: "Delete a transaction",
        tags: ["Transactions"],
        security: authSecurity,
        parameters: [idPathParam],
        responses: {
          200: successEnvelope(refSchema("MessageData"), "Transaction deleted"),
          400: validationErrorRef,
          401: unauthorizedErrorRef,
          404: notFoundErrorRef,
        },
      },
    },
    "/notes": {
      get: {
        summary: "List personal journal notes",
        tags: ["Notes"],
        security: authSecurity,
        parameters: zodQueryToParameters(listNotesQuerySchema, {
          planId: "Filter notes by monthly plan ID.",
          month: "Filter notes by plan month (1-12).",
          year: "Filter notes by plan year (2000-2100).",
          order: "Sort order by creation date (asc or desc).",
        }),
        responses: {
          200: successEnvelope(
            {
              type: "object",
              properties: {
                notes: { type: "array", items: refSchema("Note") },
              },
              required: ["notes"],
            },
            "Notes list"
          ),
          400: validationErrorRef,
          401: unauthorizedErrorRef,
        },
      },
      post: {
        summary: "Create a personal note linked to a monthly plan",
        tags: ["Notes"],
        security: authSecurity,
        requestBody: jsonRequestBody("CreateNoteInput"),
        responses: {
          201: successEnvelope(
            {
              type: "object",
              properties: { note: refSchema("Note") },
              required: ["note"],
            },
            "Created note"
          ),
          400: validationErrorRef,
          401: unauthorizedErrorRef,
          404: notFoundErrorRef,
        },
      },
    },
    "/notes/{id}": {
      get: {
        summary: "Get note by ID",
        tags: ["Notes"],
        security: authSecurity,
        parameters: [idPathParam],
        responses: {
          200: successEnvelope(
            {
              type: "object",
              properties: { note: refSchema("Note") },
              required: ["note"],
            },
            "Note details"
          ),
          400: validationErrorRef,
          401: unauthorizedErrorRef,
          404: notFoundErrorRef,
        },
      },
      put: {
        summary: "Update a personal journal note",
        tags: ["Notes"],
        security: authSecurity,
        parameters: [idPathParam],
        requestBody: jsonRequestBody("UpdateNoteInput"),
        responses: {
          200: successEnvelope(
            {
              type: "object",
              properties: { note: refSchema("Note") },
              required: ["note"],
            },
            "Updated note"
          ),
          400: validationErrorRef,
          401: unauthorizedErrorRef,
          404: notFoundErrorRef,
        },
      },
      delete: {
        summary: "Delete a personal journal note",
        tags: ["Notes"],
        security: authSecurity,
        parameters: [idPathParam],
        responses: {
          200: successEnvelope(refSchema("MessageData"), "Note deleted"),
          400: validationErrorRef,
          401: unauthorizedErrorRef,
          404: notFoundErrorRef,
        },
      },
    },
    "/monthly-reflections": {
      get: {
        summary: "List monthly reflections",
        tags: ["Reflections"],
        security: authSecurity,
        parameters: zodQueryToParameters(listReflectionsQuerySchema, {
          planId: "Filter reflections by monthly plan ID.",
          month: "Filter reflections by plan month (1-12).",
          year: "Filter reflections by plan year (2000-2100).",
        }),
        responses: {
          200: successEnvelope(
            {
              type: "object",
              properties: {
                reflections: { type: "array", items: refSchema("MonthlyReflection") },
              },
              required: ["reflections"],
            },
            "Reflections list"
          ),
          400: validationErrorRef,
          401: unauthorizedErrorRef,
        },
      },
      post: {
        summary: "Create month-end reflection (one per monthly plan)",
        tags: ["Reflections"],
        security: authSecurity,
        requestBody: jsonRequestBody("CreateReflectionInput"),
        responses: {
          201: successEnvelope(
            {
              type: "object",
              properties: { reflection: refSchema("MonthlyReflection") },
              required: ["reflection"],
            },
            "Created reflection"
          ),
          400: validationErrorRef,
          401: unauthorizedErrorRef,
          404: notFoundErrorRef,
          409: conflictErrorRef,
        },
      },
    },
    "/monthly-reflections/{id}": {
      get: {
        summary: "Get monthly reflection by ID",
        tags: ["Reflections"],
        security: authSecurity,
        parameters: [idPathParam],
        responses: {
          200: successEnvelope(
            {
              type: "object",
              properties: { reflection: refSchema("MonthlyReflection") },
              required: ["reflection"],
            },
            "Monthly reflection details"
          ),
          400: validationErrorRef,
          401: unauthorizedErrorRef,
          404: notFoundErrorRef,
        },
      },
      put: {
        summary: "Update a monthly reflection",
        tags: ["Reflections"],
        security: authSecurity,
        parameters: [idPathParam],
        requestBody: jsonRequestBody("UpdateReflectionInput"),
        responses: {
          200: successEnvelope(
            {
              type: "object",
              properties: { reflection: refSchema("MonthlyReflection") },
              required: ["reflection"],
            },
            "Updated reflection"
          ),
          400: validationErrorRef,
          401: unauthorizedErrorRef,
          404: notFoundErrorRef,
        },
      },
      delete: {
        summary: "Delete a monthly reflection",
        tags: ["Reflections"],
        security: authSecurity,
        parameters: [idPathParam],
        responses: {
          200: successEnvelope(refSchema("MessageData"), "Monthly reflection deleted"),
          400: validationErrorRef,
          401: unauthorizedErrorRef,
          404: notFoundErrorRef,
        },
      },
    },
    "/settings": {
      get: {
        summary: "Get personal application preferences for the authenticated user",
        tags: ["Settings"],
        security: authSecurity,
        responses: {
          200: successEnvelope(
            {
              type: "object",
              properties: { settings: refSchema("UserSettings") },
              required: ["settings"],
            },
            "UserSettings object"
          ),
          401: unauthorizedErrorRef,
        },
      },
      put: {
        summary: "Update personal application preferences for the authenticated user",
        tags: ["Settings"],
        security: authSecurity,
        requestBody: jsonRequestBody("UpdateUserSettingsInput"),
        responses: {
          200: successEnvelope(
            {
              type: "object",
              properties: { settings: refSchema("UserSettings") },
              required: ["settings"],
            },
            "Updated UserSettings object"
          ),
          400: validationErrorRef,
          401: unauthorizedErrorRef,
        },
      },
      patch: {
        summary: "Partially update personal application preferences",
        tags: ["Settings"],
        security: authSecurity,
        requestBody: jsonRequestBody("UpdateUserSettingsInput"),
        responses: {
          200: successEnvelope(
            {
              type: "object",
              properties: { settings: refSchema("UserSettings") },
              required: ["settings"],
            },
            "Updated UserSettings object"
          ),
          400: validationErrorRef,
          401: unauthorizedErrorRef,
        },
      },
    },
  },
};

export function setupSwagger(app: Express): void {
  app.get("/api-docs.json", (_req, res) => {
    res.json(openApiSchema);
  });

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiSchema, {
      customSiteTitle: "Kakeibo API Documentation",
      swaggerOptions: {
        persistAuthorization: true,
      },
    })
  );
}
