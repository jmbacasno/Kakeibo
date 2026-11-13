import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { bulkUpdate, index, patchSingle } from './budgets.controller.js';
import { bulkUpdateBudgetsSchema, singleBudgetSchema } from './budgets.validation.js';

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.get('/', index);
router.put('/', validateBody(bulkUpdateBudgetsSchema), bulkUpdate);
router.patch('/:categoryId', validateBody(singleBudgetSchema), patchSingle);

export default router;
