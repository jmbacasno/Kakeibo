import jwt from "jsonwebtoken";
import { TokenServiceInterface } from "../../domain/services/tokenServiceInterface.js";

export class TokenService implements TokenServiceInterface {
  private readonly secretKey: string;
  private readonly algorithm: jwt.Algorithm;
  private readonly tokenExpiresMinutes: number;

  constructor(secretKey: string, algorithm: string, tokenExpiresMinutes: number) {
    this.secretKey = secretKey;
    this.algorithm = algorithm as jwt.Algorithm;
    this.tokenExpiresMinutes = tokenExpiresMinutes;
  }

  generateToken(payload: Record<string, unknown>): string {
    return jwt.sign(payload, this.secretKey, {
      algorithm: this.algorithm,
      expiresIn: this.tokenExpiresMinutes * 60,
    });
  }

  verifyToken(token: string): Record<string, unknown> {
    const decoded = jwt.verify(token, this.secretKey, {
      algorithms: [this.algorithm],
    });
    if (typeof decoded === "string") {
      return { sub: decoded };
    }
    return decoded as Record<string, unknown>;
  }
}
