import { Router, Request, Response, NextFunction } from "express";
import { userApplicationService, tokenService, unitOfWork } from "../../dependencies.js";
import { UnauthorizedError } from "../../../application/errors.js";

const router = Router();

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string | null;
  };
}

export async function parseUserSession(req: Request, res: Response, next: NextFunction) {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  if (!token) {
    const cookie = req.headers.cookie || "";
    const match = cookie.match(/(?:^|;\s*)token=([^;]+)/);
    if (match) {
      token = match[1];
    }
  }

  if (token) {
    try {
      const decoded = tokenService.verifyToken(token);
      if (decoded && decoded.id) {
        const user = await unitOfWork.users.findById(decoded.id);
        if (user) {
          (req as AuthenticatedRequest).user = {
            id: user.id,
            email: user.email,
            name: user.name
          };
        }
      }
    } catch (err) {
      // Quietly ignore token verification / expiry errors
    }
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user) {
    throw new UnauthorizedError();
  }
  next();
}

router.get("/profile", requireAuth, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const profile = await userApplicationService.getProfile(authReq.user!.id);
  res.json({ user: profile });
});

router.put("/profile", requireAuth, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const updated = await userApplicationService.updateProfile(authReq.user!.id, req.body);
  res.json({ user: updated });
});

router.delete("/profile", requireAuth, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  await userApplicationService.deleteAccount(authReq.user!.id);
  res.clearCookie("token");
  res.json({ message: "Account successfully deactivated" });
});

router.post("/reset", requireAuth, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  await userApplicationService.resetWorkspaceData(authReq.user!.id);
  res.json({ message: "Workspace successfully reset" });
});

export default router;
