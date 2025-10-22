import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { generateAdaptiveSuggestions } from '../services/suggestions.js';

const router = Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const suggestions = await generateAdaptiveSuggestions(req.userId!);
    res.json({ success: true, data: suggestions });
  } catch (err) {
    next(err);
  }
});

export default router;
