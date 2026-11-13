import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateQuery } from '../../middleware/validate.js';
import { index } from './dashboard.controller.js';
import { dashboardQuerySchema } from './dashboard.service.js';

const router = Router();
router.use(requireAuth);

router.get('/', validateQuery(dashboardQuerySchema), index);

export default router;
