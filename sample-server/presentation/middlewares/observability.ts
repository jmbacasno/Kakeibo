import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { logger } from "../dependencies.js";

/**
 * Generates or propagates custom tracer trace IDs, continuing thread loops within AsyncLocalStorage.
 */
export function traceIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incomingTraceId = req.headers["x-correlation-id"] || req.headers["x-trace-id"];
  
  const traceId = Array.isArray(incomingTraceId)
    ? incomingTraceId[0]
    : typeof incomingTraceId === "string"
    ? incomingTraceId
    : crypto.randomUUID();

  // Set the response trace header for debugging transparency
  res.setHeader("X-Trace-ID", traceId);
  (req as any).traceId = traceId;

  logger.runWithTraceId(traceId, () => {
    next();
  });
}

/**
 * Intercepts responses, logging endpoint access, query latency, and response status codes.
 */
export function accessLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime();
  const { method, originalUrl, ip } = req;

  res.on("finish", () => {
    const diff = process.hrtime(start);
    const durationMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    const status = res.statusCode;

    let statusIcon = "🟢";
    if (status >= 500) {
      statusIcon = "🔴";
    } else if (status >= 400) {
      statusIcon = "🟡";
    } else if (status >= 300) {
      statusIcon = "🔵";
    }

    logger.info(`${statusIcon} ${method} ${originalUrl} - Status: ${status} - Response Time: ${durationMs}ms`);
  });

  next();
}
