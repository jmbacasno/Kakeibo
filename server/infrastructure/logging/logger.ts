import { AsyncLocalStorage } from "async_hooks";
import dotenv from "dotenv";
import pino from "pino";
import { LoggerInterface } from "../../domain/services/loggerInterface.js";

dotenv.config();

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class Logger implements LoggerInterface {
  private readonly pinoInstance: pino.Logger;
  private readonly traceStore = new AsyncLocalStorage<string>();

  constructor(level: string, format: string, nodeEnv: string) {
    const transport =
      format === "pretty" || (nodeEnv !== "production" && format !== "json")
        ? {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "HH:MM:ss.l",
              ignore: "pid,hostname",
            },
          }
        : undefined;

    this.pinoInstance = pino({
      level,
      mixin: () => {
        const traceId = this.pinoInstance ? this.getTraceId() : undefined;
        return traceId ? { traceId } : {};
      },
      transport,
    });
  }

  setLevel(level: LogLevel): void {
    const map: Record<LogLevel, string> = {
      [LogLevel.DEBUG]: "debug",
      [LogLevel.INFO]: "info",
      [LogLevel.WARN]: "warn",
      [LogLevel.ERROR]: "error",
    };
    this.pinoInstance.level = map[level] || "info";
  }

  private static parseArgs(message: string, ...args: unknown[]) {
    let errorObj: Error | undefined;
    const metaArray: Array<Record<string, unknown>> = [];
    const textParts: string[] = [message];

    for (const arg of args) {
      if (arg instanceof Error) {
        errorObj = arg;
      } else if (typeof arg === "object" && arg !== null) {
        metaArray.push(arg as Record<string, unknown>);
      } else {
        textParts.push(String(arg));
      }
    }

    const payload: Record<string, unknown> = Object.assign({}, ...metaArray);
    if (errorObj) {
      payload.err = errorObj;
    }

    return {
      payload,
      msg: textParts.join(" "),
    };
  }

  debug(message: string, ...args: unknown[]): void {
    const { payload, msg } = Logger.parseArgs(message, ...args);
    this.pinoInstance.debug(payload, msg);
  }

  info(message: string, ...args: unknown[]): void {
    const { payload, msg } = Logger.parseArgs(message, ...args);
    this.pinoInstance.info(payload, msg);
  }

  warn(message: string, ...args: unknown[]): void {
    const { payload, msg } = Logger.parseArgs(message, ...args);
    this.pinoInstance.warn(payload, msg);
  }

  error(message: string, ...args: unknown[]): void {
    const { payload, msg } = Logger.parseArgs(message, ...args);
    this.pinoInstance.error(payload, msg);
  }

  runWithTraceId<T>(traceId: string, fn: () => T): T {
    return this.traceStore.run(traceId, fn);
  }

  getTraceId(): string | undefined {
    return this.traceStore.getStore();
  }
}
