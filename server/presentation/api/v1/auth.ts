import { Request, Response, Router } from "express";
import { settings } from "../../../infrastructure/config.js";
import { authApplicationService } from "../../dependencies.js";
import { AUTH_COOKIE_NAME, AuthenticatedRequest, requireAuth } from "../../middlewares/auth.js";

const router = Router();

function attachAuthCookie(req: Request, res: Response, token: string): void {
  const isHttps = req.secure || req.headers["x-forwarded-proto"] === "https";
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps,
    maxAge: settings.jwtExpiresMinutes * 60 * 1000,
    path: "/",
  });
}

router.post("/register", async (req: Request, res: Response) => {
  const result = await authApplicationService.register(req.body);
  attachAuthCookie(req, res, result.token);
  res.status(201).json({
    success: true,
    data: result,
  });
});

router.post("/login", async (req: Request, res: Response) => {
  const result = await authApplicationService.login(req.body);
  attachAuthCookie(req, res, result.token);
  res.json({
    success: true,
    data: result,
  });
});

router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie(AUTH_COOKIE_NAME, { path: "/" });
  res.json({
    success: true,
    data: { message: "Logged out successfully." },
  });
});

router.get("/me", requireAuth, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const user = await authApplicationService.getMe(authReq.user!.id);
  res.json({
    success: true,
    data: { user },
  });
});

router.put("/account", requireAuth, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const result = await authApplicationService.updateAccount(authReq.user!.id, req.body);
  attachAuthCookie(req, res, result.token);
  res.json({
    success: true,
    data: result,
  });
});

router.put("/password", requireAuth, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  await authApplicationService.changePassword(authReq.user!.id, req.body);
  res.json({
    success: true,
    data: { message: "Password updated successfully." },
  });
});

export default router;
