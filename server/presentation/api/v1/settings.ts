import { Request, Response, Router } from "express";
import { userSettingsApplicationService } from "../../dependencies.js";
import { AuthenticatedRequest, requireAuth } from "../../middlewares/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const settings = await userSettingsApplicationService.getSettings(authReq.user!.id);
  res.json({
    success: true,
    data: { settings },
  });
});

router.put("/", async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const settings = await userSettingsApplicationService.updateSettings(
    authReq.user!.id,
    req.body
  );
  res.json({
    success: true,
    data: { settings },
  });
});

router.patch("/", async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const settings = await userSettingsApplicationService.updateSettings(
    authReq.user!.id,
    req.body
  );
  res.json({
    success: true,
    data: { settings },
  });
});

export default router;
