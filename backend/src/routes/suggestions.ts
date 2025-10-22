import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { generateAdaptiveSuggestions } from '../services/suggestions.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const suggestions = await generateAdaptiveSuggestions(req.userId!);
    void res.json({ success: true, data: suggestions });
  }),
);

export default router;
