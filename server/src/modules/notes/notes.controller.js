import { AppError, asyncHandler } from '../../utils/errors.js';
import { createNote, deleteNote, getNoteById, listNotes, updateNote } from './notes.service.js';

function parseId(param) {
  const id = Number(param);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('Invalid note ID.', 400);
  }
  return id;
}

export const index = asyncHandler(async (req, res) => {
  const notes = await listNotes(req.user.id, req.validatedQuery);
  res.status(200).json({ success: true, data: { notes } });
});

export const show = asyncHandler(async (req, res) => {
  const note = await getNoteById(req.user.id, parseId(req.params.id));
  res.status(200).json({ success: true, data: { note } });
});

export const store = asyncHandler(async (req, res) => {
  const note = await createNote(req.user.id, req.validatedBody);
  res.status(201).json({ success: true, data: { note } });
});

export const update = asyncHandler(async (req, res) => {
  const note = await updateNote(req.user.id, parseId(req.params.id), req.validatedBody);
  res.status(200).json({ success: true, data: { note } });
});

export const destroy = asyncHandler(async (req, res) => {
  const result = await deleteNote(req.user.id, parseId(req.params.id));
  res.status(200).json({ success: true, data: result });
});
