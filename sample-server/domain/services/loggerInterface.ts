export interface LoggerInterface {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  runWithTraceId<T>(traceId: string, fn: () => T): T;
  getTraceId(): string | undefined;
}
