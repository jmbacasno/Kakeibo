import { AppError, asyncHandler } from '../../utils/errors.js';
import {
  getPlanBudgets,
  replacePlanBudgets,
  upsertSingleCategoryBudget,
} from './budgets.service.js';

function parseId(param, label = 'ID') {
  const id = Number(param);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(`Invalid ${label}.`, 400);
  }
  return id;
}

export const index = asyncHandler(async (req, res) => {
  const budgets = await getPlanBudgets(req.user.id, parseId(req.params.id, 'plan ID'));
  res.status(200).json({ success: true, data: { budgets } });
});

export const bulkUpdate = asyncHandler(async (req, res) => {
  const plan = await replacePlanBudgets(
    req.user.id,
    parseId(req.params.id, 'plan ID'),
    req.validatedBody.budgets
  );
  res.status(200).json({ success: true, data: { plan, budgets: plan.budgets } });
});

export const patchSingle = asyncHandler(async (req, res) => {
  const budget = await upsertSingleCategoryBudget(
    req.user.id,
    parseId(req.params.id, 'plan ID'),
    parseId(req.params.categoryId, 'category ID'),
    req.validatedBody.allocatedAmount
  );
  res.status(200).json({ success: true, data: { budget } });
});
