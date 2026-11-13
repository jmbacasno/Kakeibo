import { Request, Response, Router } from "express";
import { dashboardApplicationService } from "../../dependencies.js";
import { AuthenticatedRequest, requireAuth } from "../../middlewares/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const dashboard = await dashboardApplicationService.getDashboard(
    authReq.user!.id,
    req.query
  );
  res.json({
    success: true,
    data: dashboard,
  });
});

export default router;
