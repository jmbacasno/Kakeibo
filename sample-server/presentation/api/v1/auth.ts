import { Router, Request, Response } from "express";
import { authApplicationService } from "../../dependencies.js";
import { AuthenticatedRequest } from "./users.js";

const router = Router();

router.post(
  "/register",
  async (req: Request, res: Response) => {
    const result = await authApplicationService.registerUser(req.body);
    res.setHeader("Set-Cookie", `token=${result.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`);
    res.json({
      message: "Registration successful",
      ...result
    });
  }
);

router.post(
  "/login",
  async (req: Request, res: Response) => {
    const result = await authApplicationService.loginUser(req.body);
    res.setHeader("Set-Cookie", `token=${result.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`);
    res.json({
      message: "Login successful",
      ...result
    });
  }
);

router.post("/logout", (req: Request, res: Response) => {
  res.setHeader("Set-Cookie", "token=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
  res.json({ message: "Logout successful" });
});

router.get("/me", (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  if (authReq.user) {
    res.json({ user: authReq.user });
  } else {
    res.json({ user: null });
  }
});

export default router;
