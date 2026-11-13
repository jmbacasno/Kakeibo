import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody, validateQuery } from '../../middleware/validate.js';
import { destroy, index, show, store, update, updateStatus } from './categories.controller.js';
import {
  createCategorySchema,
  listCategoriesQuerySchema,
  updateCategorySchema,
  updateCategoryStatusSchema,
} from './categories.validation.js';

const router = Router();
router.use(requireAuth);

router.get('/', validateQuery(listCategoriesQuerySchema), index);
router.get('/:id', show);
router.post('/', validateBody(createCategorySchema), store);
router.put('/:id', validateBody(updateCategorySchema), update);
router.patch('/:id/status', validateBody(updateCategoryStatusSchema), updateStatus);
router.delete('/:id', destroy);

export default router;
