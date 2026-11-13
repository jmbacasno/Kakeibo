import { Request, Response, NextFunction } from "express";

/**
 * Middleware enabling Cross-Origin Resource Sharing (CORS) with support for preflight controls.
 */
export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

  // Handle preflight requests immediately
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
}
