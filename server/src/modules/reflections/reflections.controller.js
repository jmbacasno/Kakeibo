import { AppError, asyncHandler } from '../../utils/errors.js';
import {
  createReflection,
  deleteReflection,
  getReflectionById,
  listReflections,
  updateReflection,
} from './reflections.service.js';

function parseId(param) {
  const id = Number(param);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('Invalid reflection ID.', 400);
  }
  return id;
}

export const index = asyncHandler(async (req, res) => {
  const reflections = await listReflections(req.user.id, req.validatedQuery);
  res.status(200).json({ success: true, data: { reflections } });
});

export const show = asyncHandler(async (req, res) => {
  const reflection = await getReflectionById(req.user.id, parseId(req.params.id));
  res.status(200).json({ success: true, data: { reflection } });
});

export const store = asyncHandler(async (req, res) => {
  const reflection = await createReflection(req.user.id, req.validatedBody);
  res.status(201).json({ success: true, data: { reflection } });
});

export const update = asyncHandler(async (req, res) => {
  const reflection = await updateReflection(
    req.user.id,
    parseId(req.params.id),
    req.validatedBody
  );
  res.status(200).json({ success: true, data: { reflection } });
});

export const destroy = asyncHandler(async (req, res) => {
  const result = await deleteReflection(req.user.id, parseId(req.params.id));
  res.status(200).json({ success: true, data: result });
});
