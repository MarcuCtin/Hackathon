import type { RequestHandler } from 'express';
import { verifyJwt } from '../utils/jwt.js';
import { AuthError } from '../utils/errors.js';

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AuthError('Missing or invalid Authorization header'));
  }
  const token = header.slice('Bearer '.length);
  const payload = verifyJwt<{ sub: string }>(token);
  if (!payload?.sub) {
    return next(new AuthError('Invalid token'));
  }
  req.userId = payload.sub;
  next();
};
