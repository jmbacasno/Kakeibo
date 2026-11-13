import { AppError, asyncHandler } from '../../utils/errors.js';
import {
  createTransaction,
  deleteTransaction,
  getTransactionById,
  listTransactions,
  updateTransaction,
} from './transactions.service.js';

function parseId(param) {
  const id = Number(param);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('Invalid transaction ID.', 400);
  }
  return id;
}

export const index = asyncHandler(async (req, res) => {
  const result = await listTransactions(req.user.id, req.validatedQuery);
  res.status(200).json({ success: true, data: result });
});

export const show = asyncHandler(async (req, res) => {
  const transaction = await getTransactionById(req.user.id, parseId(req.params.id));
  res.status(200).json({ success: true, data: { transaction } });
});

export const store = asyncHandler(async (req, res) => {
  const transaction = await createTransaction(req.user.id, req.validatedBody);
  res.status(201).json({ success: true, data: { transaction } });
});

export const update = asyncHandler(async (req, res) => {
  const transaction = await updateTransaction(
    req.user.id,
    parseId(req.params.id),
    req.validatedBody
  );
  res.status(200).json({ success: true, data: { transaction } });
});

export const destroy = asyncHandler(async (req, res) => {
  const result = await deleteTransaction(req.user.id, parseId(req.params.id));
  res.status(200).json({ success: true, data: result });
});
