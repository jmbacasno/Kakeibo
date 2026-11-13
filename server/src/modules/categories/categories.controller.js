import { asyncHandler, AppError } from '../../utils/errors.js';
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  listCategories,
  updateCategory,
  updateCategoryStatus,
} from './categories.service.js';

function parseId(param) {
  const id = Number(param);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('Invalid category ID.', 400);
  }
  return id;
}

export const index = asyncHandler(async (req, res) => {
  const categories = await listCategories(req.user.id, req.validatedQuery);
  res.status(200).json({ success: true, data: { categories } });
});

export const show = asyncHandler(async (req, res) => {
  const category = await getCategoryById(req.user.id, parseId(req.params.id));
  res.status(200).json({ success: true, data: { category } });
});

export const store = asyncHandler(async (req, res) => {
  const category = await createCategory(req.user.id, req.validatedBody);
  res.status(201).json({ success: true, data: { category } });
});

export const update = asyncHandler(async (req, res) => {
  const category = await updateCategory(req.user.id, parseId(req.params.id), req.validatedBody);
  res.status(200).json({ success: true, data: { category } });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const category = await updateCategoryStatus(req.user.id, parseId(req.params.id), req.validatedBody);
  res.status(200).json({ success: true, data: { category } });
});

export const destroy = asyncHandler(async (req, res) => {
  const result = await deleteCategory(req.user.id, parseId(req.params.id));
  res.status(200).json({ success: true, data: result });
});
