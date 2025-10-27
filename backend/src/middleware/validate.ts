import type { RequestHandler } from 'express';
import type { AnyZodObject, ZodEffects, ZodTypeAny } from 'zod';

type Schema = AnyZodObject | ZodEffects<ZodTypeAny>;

export const validate = (schemas: {
  body?: Schema;
  query?: Schema;
  params?: Schema;
}): RequestHandler => {
  return (req, _res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body) as unknown as typeof req.body;
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as unknown as typeof req.query;
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as unknown as typeof req.params;
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};
