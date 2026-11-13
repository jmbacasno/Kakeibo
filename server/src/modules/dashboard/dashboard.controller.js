import { asyncHandler } from '../../utils/errors.js';
import { getDashboardData } from './dashboard.service.js';

export const index = asyncHandler(async (req, res) => {
  const data = await getDashboardData(req.user.id, req.validatedQuery);
  res.status(200).json({ success: true, data });
});
