import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User.js';
import { validate } from '../middleware/validate.js';
import { signJwt } from '../utils/jwt.js';
import { AuthError } from '../utils/errors.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

router.post(
  '/register',
  validate({ body: registerSchema }),
  asyncHandler(async (req, res) => {
    const { email, password, name } = req.body as z.infer<typeof registerSchema>;
    const existing = await User.findOne({ email }).lean();
    if (existing)
      return void res.status(409).json({ success: false, error: { message: 'Email in use' } });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, name });
    const token = signJwt({ sub: String(user._id) });
    void res.status(201).json({ success: true, data: { token } });
  }),
);

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });

router.post(
  '/login',
  validate({ body: loginSchema }),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as z.infer<typeof loginSchema>;
    const user = await User.findOne({ email });
    if (!user) throw new AuthError('Invalid credentials');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new AuthError('Invalid credentials');
    const token = signJwt({ sub: String(user._id) });
    void res.json({ success: true, data: { token } });
  }),
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId).lean();
    if (!user) throw new AuthError('User not found');
    void res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        completedOnboarding: !!user.completedOnboarding,
        identityComplete: !!user.identityComplete,
      },
    });
  }),
);

export default router;
