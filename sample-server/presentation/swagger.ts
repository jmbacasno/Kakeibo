import { Express } from "express";
import swaggerUi from "swagger-ui-express";

const openApiSchema = {
  openapi: "3.0.0",
  info: {
    title: "Workspace Task Manager API",
    version: "1.0.0",
    description: "Full API documentation for managing user authentication, tasks, categories, and calendar recurrence schedules.",
  },
  servers: [
    {
      url: "/api/v1",
      description: "Base API route prefix",
    },
  ],
  components: {
    securitySchemes: {
      CookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "token",
        description: "Authentication cookie containing JWT authorization token.",
      },
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Alternative bearer token in authorization header format (Authorization: Bearer <token>).",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          email: { type: "string", format: "email", example: "user@example.com" },
          name: { type: "string", nullable: true, example: "John Doe" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Category: {
        type: "object",
        required: ["id", "name", "color", "userId"],
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Work" },
          color: { type: "string", example: "#a855f7" },
          customOrder: { type: "integer", example: 0 },
          userId: { type: "integer", example: 1 },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Step: {
        type: "object",
        required: ["id", "title", "isCompleted", "customOrder", "taskId"],
        properties: {
          id: { type: "integer", example: 1 },
          title: { type: "string", example: "Check backups" },
          isCompleted: { type: "boolean", example: false },
          customOrder: { type: "integer", example: 0 },
          taskId: { type: "integer", example: 1 },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Task: {
        type: "object",
        required: ["id", "title", "userId", "isCompleted"],
        properties: {
          id: { type: "integer", example: 1 },
          title: { type: "string", example: "Prepare project milestones" },
          notes: { type: "string", nullable: true, example: "Send slides to director" },
          isCompleted: { type: "boolean", example: false },
          completedAt: { type: "string", format: "date-time", nullable: true },
          dueDate: { type: "string", format: "date", nullable: true, example: "2026-07-05" },
          repeatType: { 
            type: "string", 
            enum: ["none", "daily", "weekly", "monthly", "yearly"], 
            example: "none" 
          },
          repeatFrequency: { type: "integer", nullable: true, example: 1 },
          repeatWeeklyOnDays: { type: "string", nullable: true, example: "Mon,Wed,Fri" },
          repeatMonthlyOnDay: { type: "integer", nullable: true, example: 14 },
          repeatEndsAtType: { type: "string", enum: ["endlessly", "date", "count"], example: "endlessly", nullable: true },
          repeatEndsAtDateDate: { type: "string", format: "date", nullable: true, example: "2026-07-31" },
          repeatEndsAtCountCount: { type: "integer", nullable: true, example: 10 },
          customOrder: { type: "integer", example: 0 },
          categoryId: { type: "integer", nullable: true, example: 1 },
          userId: { type: "integer", example: 1 },
          steps: {
            type: "array",
            items: { $ref: "#/components/schemas/Step" },
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      PerfectDay: {
        type: "object",
        required: ["id", "date", "userId"],
        properties: {
          id: { type: "integer", example: 1 },
          date: { type: "string", format: "date", example: "2026-07-05" },
          userId: { type: "integer", example: 1 },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
    },
  },
  paths: {
    "/auth/register": {
      post: {
        summary: "Register a new user",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email", example: "newuser@example.com" },
                  password: { type: "string", format: "password", example: "strongpassword123" },
                  name: { type: "string", example: "Jane Doe" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Registration successful. Attaches cookie 'token'.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Registration successful" },
                    token: { type: "string" },
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          400: { description: "Invalid login credentials or email already exists." },
        },
      },
    },
    "/auth/login": {
      post: {
        summary: "Log in with email and password",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email", example: "newuser@example.com" },
                  password: { type: "string", format: "password", example: "strongpassword123" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful. Attaches cookie 'token'.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Login successful" },
                    token: { type: "string" },
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized. Email, password incorrect." },
        },
      },
    },
    "/auth/logout": {
      post: {
        summary: "Log out user from current session",
        tags: ["Authentication"],
        responses: {
          200: {
            description: "Logout successful. Clears authentication cookie.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Logout successful" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/auth/me": {
      get: {
        summary: "Retrieve active authenticated session details",
        tags: ["Authentication"],
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        responses: {
          200: {
            description: "Current user session context",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: {
                      anyOf: [
                        { $ref: "#/components/schemas/User" },
                        { type: "null" }
                      ]
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/users/profile": {
      get: {
        summary: "Retrieve user account profile information",
        tags: ["Users"],
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        responses: {
          200: {
            description: "Full user profile details structure",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
        },
      },
      put: {
        summary: "Update user profile metrics",
        tags: ["Users"],
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "John Smith" },
                  email: { type: "string", format: "email", example: "john.smith@example.com" },
                  password: { type: "string", minLength: 6, example: "optionalNewPassword" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Updated user profile database representation",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
        },
      },
      delete: {
        summary: "Permanently deactivate and delete user profile account",
        tags: ["Users"],
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        responses: {
          200: {
            description: "Deactivation confirm feedback message",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Account successfully deactivated" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/users/reset": {
      post: {
        summary: "Reset all dashboard workspace tasks and custom categories completely",
        tags: ["Users"],
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        responses: {
          200: {
            description: "Reset successfully executed message confirmation",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Workspace successfully reset" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/categories": {
      get: {
        summary: "Fetch all custom structural categories",
        tags: ["Categories"],
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        responses: {
          200: {
            description: "List of matched user database categories",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    categories: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Category" },
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
        },
      },
      post: {
        summary: "Create a new custom category tag",
        tags: ["Categories"],
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string", example: "Personal Expenses" },
                  color: { type: "string", example: "#a855f7" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Newly created instance model representation",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    category: { $ref: "#/components/schemas/Category" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/categories/reorder": {
      put: {
        summary: "Reorder categories globally using custom orderList",
        tags: ["Categories"],
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["orderList"],
                properties: {
                  orderList: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["id", "customOrder"],
                      properties: {
                        id: { type: "integer", example: 1 },
                        customOrder: { type: "integer", example: 0 }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Reordered categories successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Reordered categories successfully" }
                  }
                }
              }
            }
          },
          401: { description: "Unauthorized" }
        }
      }
    },
    "/categories/{id}": {
      put: {
        summary: "Update custom category attributes",
        tags: ["Categories"],
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Mathematical database ID value of target category tag",
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Active Freelancing Tasks" },
                  color: { type: "string", example: "#10b981" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Updated category representation",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    category: { $ref: "#/components/schemas/Category" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          404: { description: "Category target path ID values not found" },
        },
      },
      delete: {
        summary: "Permanently delete category and wipe reference relations safely",
        tags: ["Categories"],
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Database category sequence ID key to erase",
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Delete sequence succeeded confirmation message",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Category deleted successfully" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          404: { description: "Category target identifier reference missing" },
        },
      },
    },
    "/perfect-days": {
      get: {
        summary: "Fetch all perfect days recorded for the current user",
        tags: ["Perfect Days"],
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        responses: {
          200: {
            description: "List of recorded perfect days dates",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    perfectDays: {
                      type: "array",
                      items: { type: "string", example: "2026-07-05" }
                    }
                  }
                }
              }
            }
          },
          401: { description: "Unauthorized" }
        }
      }
    },
    "/tasks": {
      get: {
        summary: "Retrieve task cards and active repeat routines schedule lists",
        tags: ["Tasks"],
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        responses: {
          200: {
            description: "List of matched user tasks with customized configurations",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    tasks: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Task" },
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
        },
      },
      post: {
        summary: "Establish and save a new user task object",
        tags: ["Tasks"],
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title"],
                properties: {
                  title: { type: "string", example: "Perform Database Diagnostic" },
                  notes: { type: "string", example: "Ensure local.db is detached" },
                  categoryId: { type: "integer", nullable: true, example: 2 },
                  isCompleted: { type: "boolean", default: false },
                  dueDate: { type: "string", format: "date", nullable: true, example: "2026-07-05" },
                  repeatType: { type: "string", enum: ["none", "daily", "weekly", "monthly", "yearly"], default: "none" },
                  repeatFrequency: { type: "integer", nullable: true, example: 1 },
                  repeatWeeklyOnDays: { type: "string", nullable: true, example: "Mon,Wed,Fri" },
                  repeatMonthlyOnDay: { type: "integer", nullable: true, example: 14 },
                  repeatEndsAtType: { type: "string", enum: ["endlessly", "date", "count"], nullable: true, default: "endlessly" },
                  repeatEndsAtDateDate: { type: "string", format: "date", nullable: true, example: "2026-07-31" },
                  repeatEndsAtCountCount: { type: "integer", nullable: true, example: 10 },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Created task record model object",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    task: { $ref: "#/components/schemas/Task" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/tasks/reorder": {
      put: {
        summary: "Reorder tasks globally using custom item ID lists",
        tags: ["Tasks"],
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["orderList"],
                properties: {
                  orderList: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["id", "customOrder"],
                      properties: {
                        id: { type: "integer", example: 1 },
                        customOrder: { type: "integer", example: 0 }
                      }
                    }
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Success confirmation",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Reordered list successfully" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/tasks/bulk": {
      patch: {
        summary: "Perform bulk updates on multiple tasks",
        tags: ["Tasks"],
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["ids", "data"],
                properties: {
                  ids: {
                    type: "array",
                    items: { type: "integer" },
                    example: [1, 2, 3]
                  },
                  data: {
                    type: "object",
                    properties: {
                      isCompleted: { type: "boolean", example: true },
                      clientLocalDate: { type: "string", example: "2026-07-05" },
                      categoryId: { type: "integer", nullable: true, example: 1 },
                      dueDate: { type: "string", format: "date-time", nullable: true }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Successfully updated tasks",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Tasks updated successfully" },
                    perfectDayLogged: { type: "boolean", example: false }
                  }
                }
              }
            }
          },
          401: { description: "Unauthorized" }
        }
      },
      delete: {
        summary: "Perform bulk deletion of tasks",
        tags: ["Tasks"],
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["ids"],
                properties: {
                  ids: {
                    type: "array",
                    items: { type: "integer" },
                    example: [1, 2, 3]
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Successfully deleted tasks in bulk",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Tasks deleted successfully" }
                  }
                }
              }
            }
          },
          401: { description: "Unauthorized" }
        }
      }
    },
    "/tasks/{id}": {
      put: {
        summary: "Update existing task properties or trigger manual status toggling",
        tags: ["Tasks"],
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Database task identifier ID mapping",
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string", example: "Perform Database Diagnostic [Running]" },
                  notes: { type: "string" },
                  isCompleted: { type: "boolean", example: true },
                  clientLocalDate: { type: "string", example: "2026-07-05", description: "Local date YYYY-MM-DD of the client when completing a task to record perfect days" },
                  dueDate: { type: "string", format: "date", nullable: true, example: "2026-07-05" },
                  repeatType: { type: "string", enum: ["none", "daily", "weekly", "monthly", "yearly"] },
                  repeatFrequency: { type: "integer", nullable: true },
                  repeatWeeklyOnDays: { type: "string", nullable: true },
                  repeatMonthOnDay: { type: "integer", nullable: true },
                  repeatEndsAtType: { type: "string", enum: ["endlessly", "date", "count"], nullable: true },
                  repeatEndsAtDateDate: { type: "string", format: "date", nullable: true },
                  repeatEndsAtCountCount: { type: "integer", nullable: true },
                  categoryId: { type: "integer", nullable: true },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Update results containing both the modified task and any spawned recurrence children instances",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    task: { $ref: "#/components/schemas/Task" },
                    recurringSpawned: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Task" },
                      description: "Spawned child task triggers generated upon completion loops of parent tasks",
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          404: { description: "Target task context ID details not found" },
        },
      },
      delete: {
        summary: "Remove an active task from workspace",
        tags: ["Tasks"],
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Identifier sequence code ID of targeting task item to eliminate",
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Cancellation output",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Task deleted successfully" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          404: { description: "Requested task code sequence does not exist or matches another workspace owner" },
        },
      },
    },
    "/tasks/{id}/duplicate": {
      post: {
        summary: "Duplicate an existing task by ID",
        tags: ["Tasks"],
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Database task ID value of target task to duplicate",
            schema: { type: "integer" },
          }
        ],
        responses: {
          201: {
            description: "Duplicated task representation",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    task: { $ref: "#/components/schemas/Task" }
                  }
                }
              }
            }
          },
          401: { description: "Unauthorized" },
          404: { description: "Target task ID not found" }
        }
      }
    },
  },
};

export function setupSwagger(app: any) {
  // Setup Swagger UI assets route
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSchema, {
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui { background-color: #0f172a !important; color: #f8fafc !important; }
      .swagger-ui .info .title, .swagger-ui .info p, .swagger-ui .info a, .swagger-ui .info li, .swagger-ui .info code, .swagger-ui h2, .swagger-ui h3, .swagger-ui h4, .swagger-ui h5 { color: #f1f5f9 !important; }
      .swagger-ui .scheme-container { background-color: #1e293b !important; box-shadow: none !important; border: 1px solid #334155 !important; }
      .swagger-ui .opblock .opblock-summary-operation-id, .swagger-ui .opblock .opblock-summary-path, .swagger-ui .opblock .opblock-summary-description { color: #cbd5e1 !important; }
      .swagger-ui .opblock-description-wrapper p, .swagger-ui .opblock-external-docs-wrapper p, .swagger-ui .opblock-title_normal p { color: #94a3b8 !important; }
      .swagger-ui .opblock .tabheader li button.tablinks { color: #cbd5e1 !important; }
      .swagger-ui .dialog-ux .modal-ux { background-color: #0f172a !important; border: 1px solid #475569 !important; }
      .swagger-ui .dialog-ux .modal-ux-header h3 { color: #f1f5f9 !important; }
      .swagger-ui .parameter__name { color: #f1f5f9 !important; }
      .swagger-ui .parameter__type { color: #cbd5e1 !important; }
    `
  }));
}
