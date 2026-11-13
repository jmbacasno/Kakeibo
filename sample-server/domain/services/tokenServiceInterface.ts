export interface TokenServiceInterface {
  generateToken(payload: any): string;
  verifyToken(token: string): any;
}
