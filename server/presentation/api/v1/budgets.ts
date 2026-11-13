import { Request, Response, Router } from "express";
import { categoryBudgetApplicationService } from "../../dependencies.js";
import { AuthenticatedRequest, requireAuth } from "../../middlewares/auth.js";
import { validateIdParam } from "../../middlewares/validation.js";

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.get("/", validateIdParam, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const budgets = await categoryBudgetApplicationService.getPlanBudgets(
    authReq.user!.id,
    Number(req.params.id)
  );
  res.json({
    success: true,
    data: { budgets },
  });
});

router.put("/", validateIdParam, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const plan = await categoryBudgetApplicationService.replacePlanBudgets(
    authReq.user!.id,
    Number(req.params.id),
    req.body
  );
  res.json({
    success: true,
    data: { plan },
  });
});

router.patch("/:categoryId", validateIdParam, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const budget = await categoryBudgetApplicationService.upsertSingleBudget(
    authReq.user!.id,
    Number(req.params.id),
    Number(req.params.categoryId),
    req.body
  );
  res.json({
    success: true,
    data: { budget },
  });
});

export default router;
