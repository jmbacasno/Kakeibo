import { Request, Response, Router } from "express";
import { categoryApplicationService } from "../../dependencies.js";
import { AuthenticatedRequest, requireAuth } from "../../middlewares/auth.js";
import { validateIdParam } from "../../middlewares/validation.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const categories = await categoryApplicationService.listCategories(
    authReq.user!.id,
    req.query
  );
  res.json({
    success: true,
    data: { categories },
  });
});

router.get("/:id", validateIdParam, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const category = await categoryApplicationService.getCategoryById(
    authReq.user!.id,
    Number(req.params.id)
  );
  res.json({
    success: true,
    data: { category },
  });
});

router.post("/", async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const category = await categoryApplicationService.createCategory(authReq.user!.id, req.body);
  res.status(201).json({
    success: true,
    data: { category },
  });
});

router.put("/:id", validateIdParam, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const category = await categoryApplicationService.updateCategory(
    authReq.user!.id,
    Number(req.params.id),
    req.body
  );
  res.json({
    success: true,
    data: { category },
  });
});

router.patch("/:id/status", validateIdParam, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const category = await categoryApplicationService.updateCategoryStatus(
    authReq.user!.id,
    Number(req.params.id),
    req.body
  );
  res.json({
    success: true,
    data: { category },
  });
});

router.delete("/:id", validateIdParam, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  await categoryApplicationService.deleteCategory(authReq.user!.id, Number(req.params.id));
  res.json({
    success: true,
    data: { message: "Category deleted." },
  });
});

export default router;
