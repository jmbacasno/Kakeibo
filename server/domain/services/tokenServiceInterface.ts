export interface TokenServiceInterface {
  generateToken(payload: Record<string, unknown>): string;
  verifyToken(token: string): Record<string, unknown>;
}
