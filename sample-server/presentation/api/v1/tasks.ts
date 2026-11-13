import { Router, Request, Response, NextFunction } from "express";
import { taskApplicationService } from "../../dependencies.js";
import { requireAuth, AuthenticatedRequest } from "./users.js";
import { validateIdParam } from "../../middlewares/validation.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const tasks = await taskApplicationService.getTasks(authReq.user!.id);
  res.json({ tasks });
});

router.post("/", async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const task = await taskApplicationService.createTask(authReq.user!.id, req.body);
  res.status(201).json({ task });
});

router.put("/reorder", async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  await taskApplicationService.reorderTasks(authReq.user!.id, req.body.orderList);
  res.json({ success: true, message: "Reordered list successfully" });
});

router.put("/:id", validateIdParam, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const taskId = parseInt(req.params.id, 10);
  const userId = authReq.user!.id;

  if (req.body.isCompleted !== undefined) {
    if (req.body.isCompleted) {
      const result = await taskApplicationService.completeTask(userId, taskId, req.body.clientLocalDate);
      res.json({
        task: result.updated,
        recurringSpawned: result.repeatSpawned,
        perfectDayLogged: result.perfectDayLogged
      });
    } else {
      const updated = await taskApplicationService.uncompleteTask(userId, taskId);
      res.json({
        task: updated,
        recurringSpawned: null,
        perfectDayLogged: false
      });
    }
  } else {
    const updated = await taskApplicationService.editTask(userId, taskId, req.body);
    res.json({
      task: updated,
      recurringSpawned: null,
      perfectDayLogged: false
    });
  }
});

router.post("/:id/duplicate", validateIdParam, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const taskId = parseInt(req.params.id, 10);
  const task = await taskApplicationService.duplicateTask(authReq.user!.id, taskId);
  res.status(201).json({ task });
});

router.patch("/bulk", async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user!.id;
  const { ids, data } = req.body;

  let perfectDayLogged = false;
  if (data && data.isCompleted !== undefined) {
    if (data.isCompleted) {
      perfectDayLogged = await taskApplicationService.completeTasks(userId, ids, data.clientLocalDate);
    }
  } else {
    await taskApplicationService.editTasks(userId, ids, data);
  }
  
  res.json({ success: true, message: "Tasks updated successfully", perfectDayLogged });
});

router.delete("/bulk", async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user!.id;
  const { ids } = req.body;

  await taskApplicationService.deleteTasks(userId, ids);
  res.json({ success: true, message: "Tasks deleted successfully" });
});

router.delete("/:id", validateIdParam, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const taskId = parseInt(req.params.id, 10);
  await taskApplicationService.deleteTask(authReq.user!.id, taskId);
  res.json({ success: true, message: "Task deleted successfully" });
});

export default router;
