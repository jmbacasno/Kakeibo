import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { logger } from "../dependencies.js";

export function traceIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incomingTraceId = req.headers["x-correlation-id"] || req.headers["x-trace-id"];

  const traceId = Array.isArray(incomingTraceId)
    ? incomingTraceId[0]
    : typeof incomingTraceId === "string"
    ? incomingTraceId
    : crypto.randomUUID();

  res.setHeader("X-Trace-ID", traceId);
  (req as Request & { traceId?: string }).traceId = traceId;

  logger.runWithTraceId(traceId, () => {
    next();
  });
}

export function accessLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime();
  const { method, originalUrl } = req;

  res.on("finish", () => {
    if (!originalUrl.startsWith("/api")) {
      return;
    }
    const diff = process.hrtime(start);
    const durationMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    const status = res.statusCode;

    let statusLabel = "OK";
    if (status >= 500) {
      statusLabel = "ERR";
    } else if (status >= 400) {
      statusLabel = "WARN";
    } else if (status >= 300) {
      statusLabel = "REDIR";
    }

    logger.info(`[${statusLabel}] ${method} ${originalUrl} - ${status} (${durationMs}ms)`);
  });

  next();
}
