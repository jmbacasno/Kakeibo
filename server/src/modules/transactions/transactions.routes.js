import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody, validateQuery } from '../../middleware/validate.js';
import { destroy, index, show, store, update } from './transactions.controller.js';
import {
  createTransactionSchema,
  listTransactionsQuerySchema,
  updateTransactionSchema,
} from './transactions.validation.js';

const router = Router();
router.use(requireAuth);

router.get('/', validateQuery(listTransactionsQuerySchema), index);
router.get('/:id', show);
router.post('/', validateBody(createTransactionSchema), store);
router.put('/:id', validateBody(updateTransactionSchema), update);
router.delete('/:id', destroy);

export default router;
