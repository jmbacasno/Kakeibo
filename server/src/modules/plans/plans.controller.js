import { AppError, asyncHandler } from '../../utils/errors.js';
import {
  createPlan,
  getPlanById,
  getPlanByMonthYear,
  listPlans,
  updatePlan,
  updatePlanStatus,
} from './plans.service.js';

function parseId(param) {
  const id = Number(param);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('Invalid monthly plan ID.', 400);
  }
  return id;
}

export const index = asyncHandler(async (req, res) => {
  const plans = await listPlans(req.user.id);
  res.status(200).json({ success: true, data: { plans } });
});

export const current = asyncHandler(async (req, res) => {
  const { month, year } = req.validatedQuery;
  const plan = await getPlanByMonthYear(req.user.id, month, year);
  res.status(200).json({ success: true, data: { plan } });
});

export const show = asyncHandler(async (req, res) => {
  const plan = await getPlanById(req.user.id, parseId(req.params.id));
  res.status(200).json({ success: true, data: { plan } });
});

export const store = asyncHandler(async (req, res) => {
  const plan = await createPlan(req.user.id, req.validatedBody);
  res.status(201).json({ success: true, data: { plan } });
});

export const update = asyncHandler(async (req, res) => {
  const plan = await updatePlan(req.user.id, parseId(req.params.id), req.validatedBody);
  res.status(200).json({ success: true, data: { plan } });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const plan = await updatePlanStatus(req.user.id, parseId(req.params.id), req.validatedBody.status);
  res.status(200).json({ success: true, data: { plan } });
});

export const summary = asyncHandler(async (req, res) => {
  const plan = await getPlanById(req.user.id, parseId(req.params.id));
  res.status(200).json({ success: true, data: { summary: plan.summary, planId: plan.id, month: plan.month, year: plan.year } });
});
