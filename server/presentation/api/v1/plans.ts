import { Request, Response, Router } from "express";
import { monthlyPlanApplicationService } from "../../dependencies.js";
import { AuthenticatedRequest, requireAuth } from "../../middlewares/auth.js";
import { validateIdParam } from "../../middlewares/validation.js";
import budgetRoutes from "./budgets.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const plans = await monthlyPlanApplicationService.listPlans(authReq.user!.id);
  res.json({
    success: true,
    data: { plans },
  });
});

router.get("/current", async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const plan = await monthlyPlanApplicationService.getCurrentPlan(authReq.user!.id, req.query);
  res.json({
    success: true,
    data: { plan },
  });
});

router.get("/:id", validateIdParam, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const plan = await monthlyPlanApplicationService.getPlanById(
    authReq.user!.id,
    Number(req.params.id)
  );
  res.json({
    success: true,
    data: { plan },
  });
});

router.get("/:id/summary", validateIdParam, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const summary = await monthlyPlanApplicationService.getPlanSummary(
    authReq.user!.id,
    Number(req.params.id)
  );
  res.json({
    success: true,
    data: { summary },
  });
});

router.post("/", async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const plan = await monthlyPlanApplicationService.createPlan(authReq.user!.id, req.body);
  res.status(201).json({
    success: true,
    data: { plan },
  });
});

router.put("/:id", validateIdParam, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const plan = await monthlyPlanApplicationService.updatePlan(
    authReq.user!.id,
    Number(req.params.id),
    req.body
  );
  res.json({
    success: true,
    data: { plan },
  });
});

router.patch("/:id/status", validateIdParam, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const plan = await monthlyPlanApplicationService.updatePlanStatus(
    authReq.user!.id,
    Number(req.params.id),
    req.body
  );
  res.json({
    success: true,
    data: { plan },
  });
});

router.use("/:id/budgets", budgetRoutes);

export default router;
