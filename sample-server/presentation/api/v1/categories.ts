import { Router, Request, Response, NextFunction } from "express";
import { categoryApplicationService } from "../../dependencies.js";
import { requireAuth, AuthenticatedRequest } from "./users.js";
import { validateIdParam } from "../../middlewares/validation.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const categories = await categoryApplicationService.getCategories(authReq.user!.id);
  res.json({ categories });
});

router.post("/", async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const category = await categoryApplicationService.createCategory(authReq.user!.id, req.body);
  res.status(201).json({ category });
});

router.put("/reorder", async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  await categoryApplicationService.reorderCategories(authReq.user!.id, req.body.orderList);
  res.json({ success: true, message: "Reordered categories successfully" });
});

router.put("/:id", validateIdParam, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const catId = parseInt(req.params.id, 10);
  const category = await categoryApplicationService.updateCategory(authReq.user!.id, catId, req.body);
  res.json({ category });
});

router.delete("/:id", validateIdParam, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const catId = parseInt(req.params.id, 10);
  await categoryApplicationService.deleteCategory(authReq.user!.id, catId);
  res.json({ success: true, message: "Category deleted successfully" });
});

export default router;
