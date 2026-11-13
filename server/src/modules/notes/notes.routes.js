import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody, validateQuery } from '../../middleware/validate.js';
import { destroy, index, show, store, update } from './notes.controller.js';
import { createNoteSchema, listNotesQuerySchema, updateNoteSchema } from './notes.validation.js';

const router = Router();
router.use(requireAuth);

router.get('/', validateQuery(listNotesQuerySchema), index);
router.get('/:id', show);
router.post('/', validateBody(createNoteSchema), store);
router.put('/:id', validateBody(updateNoteSchema), update);
router.delete('/:id', destroy);

export default router;
