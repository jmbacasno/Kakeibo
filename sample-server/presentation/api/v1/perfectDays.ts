import { Router, Request, Response } from "express";
import { perfectDayApplicationService } from "../../dependencies.js";
import { requireAuth, AuthenticatedRequest } from "./users.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const perfectDays = await perfectDayApplicationService.getPerfectDays(authReq.user!.id);
  res.json({ perfectDays });
});

export default router;
