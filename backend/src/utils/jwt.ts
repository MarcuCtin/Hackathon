import jwt from 'jsonwebtoken';
import { loadEnv } from '../config/env.js';

const env = loadEnv();

export function signJwt(payload: object, expiresIn = '7d'): string {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn } as any);
}

export function verifyJwt<T>(token: string): T | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as T;
  } catch {
    return null;
  }
}
