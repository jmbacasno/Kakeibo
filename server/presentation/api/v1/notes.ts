import { Request, Response, Router } from "express";
import { noteApplicationService } from "../../dependencies.js";
import { AuthenticatedRequest, requireAuth } from "../../middlewares/auth.js";
import { validateIdParam } from "../../middlewares/validation.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const notes = await noteApplicationService.listNotes(authReq.user!.id, req.query);
  res.json({
    success: true,
    data: { notes },
  });
});

router.get("/:id", validateIdParam, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const note = await noteApplicationService.getNoteById(authReq.user!.id, Number(req.params.id));
  res.json({
    success: true,
    data: { note },
  });
});

router.post("/", async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const note = await noteApplicationService.createNote(authReq.user!.id, req.body);
  res.status(201).json({
    success: true,
    data: { note },
  });
});

router.put("/:id", validateIdParam, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const note = await noteApplicationService.updateNote(
    authReq.user!.id,
    Number(req.params.id),
    req.body
  );
  res.json({
    success: true,
    data: { note },
  });
});

router.delete("/:id", validateIdParam, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  await noteApplicationService.deleteNote(authReq.user!.id, Number(req.params.id));
  res.json({
    success: true,
    data: { message: "Note deleted." },
  });
});

export default router;
