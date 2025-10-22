import jwt, { type SignOptions } from 'jsonwebtoken';
import { loadEnv } from '../config/env.js';

const env = loadEnv();

export function signJwt(payload: object, expiresIn: SignOptions['expiresIn'] = '7d'): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
}

export function verifyJwt<T>(token: string): T | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as T;
  } catch {
    return null;
  }
}
