import { Request, Response, Router } from "express";
import { transactionApplicationService } from "../../dependencies.js";
import { AuthenticatedRequest, requireAuth } from "../../middlewares/auth.js";
import { validateIdParam } from "../../middlewares/validation.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const result = await transactionApplicationService.listTransactions(
    authReq.user!.id,
    req.query
  );
  res.json({
    success: true,
    data: result,
  });
});

router.get("/:id", validateIdParam, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const transaction = await transactionApplicationService.getTransactionById(
    authReq.user!.id,
    Number(req.params.id)
  );
  res.json({
    success: true,
    data: { transaction },
  });
});

router.post("/", async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const transaction = await transactionApplicationService.createTransaction(
    authReq.user!.id,
    req.body
  );
  res.status(201).json({
    success: true,
    data: { transaction },
  });
});

router.put("/:id", validateIdParam, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const transaction = await transactionApplicationService.updateTransaction(
    authReq.user!.id,
    Number(req.params.id),
    req.body
  );
  res.json({
    success: true,
    data: { transaction },
  });
});

router.delete("/:id", validateIdParam, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  await transactionApplicationService.deleteTransaction(
    authReq.user!.id,
    Number(req.params.id)
  );
  res.json({
    success: true,
    data: { message: "Transaction deleted." },
  });
});

export default router;
