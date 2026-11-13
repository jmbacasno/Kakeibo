import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody, validateQuery } from '../../middleware/validate.js';
import { destroy, index, show, store, update } from './reflections.controller.js';
import {
  createReflectionSchema,
  listReflectionsQuerySchema,
  updateReflectionSchema,
} from './reflections.validation.js';

const router = Router();
router.use(requireAuth);

router.get('/', validateQuery(listReflectionsQuerySchema), index);
router.get('/:id', show);
router.post('/', validateBody(createReflectionSchema), store);
router.put('/:id', validateBody(updateReflectionSchema), update);
router.delete('/:id', destroy);

export default router;
