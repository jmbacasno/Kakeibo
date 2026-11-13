import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody, validateQuery } from '../../middleware/validate.js';
import { current, index, show, store, summary, update, updateStatus } from './plans.controller.js';
import {
  createPlanSchema,
  currentPlanQuerySchema,
  updatePlanSchema,
  updatePlanStatusSchema,
} from './plans.validation.js';

const router = Router();
router.use(requireAuth);

router.get('/', index);
router.get('/current', validateQuery(currentPlanQuerySchema), current);
router.get('/:id', show);
router.get('/:id/summary', summary);
router.post('/', validateBody(createPlanSchema), store);
router.put('/:id', validateBody(updatePlanSchema), update);
router.patch('/:id/status', validateBody(updatePlanStatusSchema), updateStatus);

export default router;
