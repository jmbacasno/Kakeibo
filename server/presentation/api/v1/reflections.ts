import { Request, Response, Router } from "express";
import { monthlyReflectionApplicationService } from "../../dependencies.js";
import { AuthenticatedRequest, requireAuth } from "../../middlewares/auth.js";
import { validateIdParam } from "../../middlewares/validation.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const reflections = await monthlyReflectionApplicationService.listReflections(
    authReq.user!.id,
    req.query
  );
  res.json({
    success: true,
    data: { reflections },
  });
});

router.get("/:id", validateIdParam, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const reflection = await monthlyReflectionApplicationService.getReflectionById(
    authReq.user!.id,
    Number(req.params.id)
  );
  res.json({
    success: true,
    data: { reflection },
  });
});

router.post("/", async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const reflection = await monthlyReflectionApplicationService.createReflection(
    authReq.user!.id,
    req.body
  );
  res.status(201).json({
    success: true,
    data: { reflection },
  });
});

router.put("/:id", validateIdParam, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const reflection = await monthlyReflectionApplicationService.updateReflection(
    authReq.user!.id,
    Number(req.params.id),
    req.body
  );
  res.json({
    success: true,
    data: { reflection },
  });
});

router.delete("/:id", validateIdParam, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  await monthlyReflectionApplicationService.deleteReflection(
    authReq.user!.id,
    Number(req.params.id)
  );
  res.json({
    success: true,
    data: { message: "Monthly reflection deleted." },
  });
});

export default router;
