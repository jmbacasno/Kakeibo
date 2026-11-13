import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../../application/errors.js";
import { tokenService, unitOfWork } from "../dependencies.js";

export const AUTH_COOKIE_NAME = "kakeibo_token";

export interface AuthenticatedUserContext {
  id: number;
  email: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUserContext;
}

function extractToken(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  if (req.cookies) {
    const cookieToken = req.cookies[AUTH_COOKIE_NAME] || req.cookies.token;
    if (typeof cookieToken === "string" && cookieToken.length > 0) {
      return cookieToken;
    }
  }

  return undefined;
}

export async function parseUserSession(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractToken(req);

  if (token) {
    try {
      const decoded = tokenService.verifyToken(token);
      const rawId = decoded.sub ?? decoded.id;
      const userId = typeof rawId === "number" ? rawId : parseInt(String(rawId), 10);

      if (!Number.isNaN(userId) && userId > 0) {
        const user = await unitOfWork.users.findById(userId);
        if (user && user.id) {
          (req as AuthenticatedRequest).user = {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        }
      }
    } catch {
      // Ignore expired or invalid tokens so requireAuth handles protected routes cleanly
    }
  }

  next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user) {
    throw new UnauthorizedError("Authentication required. Please sign in.");
  }
  next();
}
