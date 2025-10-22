import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger.js';
import { AppError, ValidationError } from '../utils/errors.js';

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Not found' } });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let status = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Something went wrong';
  let details: unknown;

  if (err instanceof ZodError) {
    const zodDetails = err.issues.map((i) => ({ path: i.path, message: i.message }));
    const vErr = new ValidationError('Invalid request', zodDetails);
    status = vErr.statusCode;
    code = vErr.code;
    message = vErr.message;
    details = vErr.details;
  } else if (err instanceof AppError) {
    status = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (isMongoServerError(err)) {
    status = 409;
    code = 'MONGO_ERROR';
    message = 'Database error';
    details = { name: err.name, message: err.message };
  }

  if (status >= 500) {
    logger.error({ err }, 'Unhandled error');
  } else {
    logger.warn({ err }, 'Handled error');
  }

  res.status(status).json({ success: false, error: { code, message, details } });
};

function isMongoServerError(err: unknown): err is { name: string; message: string } {
  if (typeof err !== 'object' || err === null) return false;
  const e = err as { name?: unknown; message?: unknown };
  return e.name === 'MongoServerError' && typeof e.message === 'string';
}
