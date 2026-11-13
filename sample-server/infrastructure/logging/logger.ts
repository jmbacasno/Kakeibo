import dotenv from "dotenv";
import pino from "pino";
import { AsyncLocalStorage } from "async_hooks";
import { LoggerInterface } from "../../domain/services/loggerInterface.js";

// Ensure environment variables are loaded if logger is loaded first
dotenv.config();

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// Enterprise structured formatting: use 'pino-pretty' in development/test unless JSON is explicitly forced,
// and default to high-performance raw JSON serialization in production.
export class Logger implements LoggerInterface {
  private readonly pinoInstance: pino.Logger;
  private readonly traceStore = new AsyncLocalStorage<string>();

  constructor(level: string, format: string, nodeEnv: string) {
    const transport = (format === "pretty" || (nodeEnv !== "production" && format !== "json"))
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss.l",
            ignore: "pid,hostname",
          },
        }
      : undefined;

    const self = this;
    this.pinoInstance = pino({
      level,
      mixin() {
        const traceId = self.pinoInstance ? self.getTraceId() : undefined;
        return traceId ? { traceId } : {};
      },
      transport,
    });
  }

  /**
   * Sets the logging level dynamically.
   */
  setLevel(level: LogLevel) {
    let pinoLevel = "info";
    switch (level) {
      case LogLevel.DEBUG:
        pinoLevel = "debug";
        break;
      case LogLevel.INFO:
        pinoLevel = "info";
        break;
      case LogLevel.WARN:
        pinoLevel = "warn";
        break;
      case LogLevel.ERROR:
        pinoLevel = "error";
        break;
    }
    this.pinoInstance.level = pinoLevel;
  }

  /**
   * Universal argument parser to map call-sites using (message, ...args) safely to Pino's structured format (payload, message).
   * Automatically isolates Error instances under pino's standard "err" key and merges direct objects into the payload.
   */
  private static parseArgs(message: string, ...args: any[]) {
    let errorObj: Error | undefined = undefined;
    const metaArray: any[] = [];
    const textParts: string[] = [message];

    for (const arg of args) {
      if (arg instanceof Error) {
        errorObj = arg;
      } else if (typeof arg === "object" && arg !== null) {
        metaArray.push(arg);
      } else {
        textParts.push(String(arg));
      }
    }

    const finalMeta = metaArray.reduce((acc, current) => {
      return { ...acc, ...current };
    }, {});

    const payload: Record<string, any> = { ...finalMeta };
    if (errorObj) {
      payload.err = errorObj;
    }

    return {
      payload,
      msg: textParts.join(" "),
    };
  }

  debug(message: string, ...args: any[]) {
    const { payload, msg } = Logger.parseArgs(message, ...args);
    this.pinoInstance.debug(payload, msg);
  }

  info(message: string, ...args: any[]) {
    const { payload, msg } = Logger.parseArgs(message, ...args);
    this.pinoInstance.info(payload, msg);
  }

  warn(message: string, ...args: any[]) {
    const { payload, msg } = Logger.parseArgs(message, ...args);
    this.pinoInstance.warn(payload, msg);
  }

  error(message: string, ...args: any[]) {
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

