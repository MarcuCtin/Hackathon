import type { RequestHandler } from 'express';
import type { AnyZodObject, ZodEffects } from 'zod';

type Schema = AnyZodObject | ZodEffects<any>;

export const validate = (schemas: {
  body?: Schema;
  query?: Schema;
  params?: Schema;
}): RequestHandler => {
  return (req, _res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) req.query = schemas.query.parse(req.query);
      if (schemas.params) req.params = schemas.params.parse(req.params);
      next();
    } catch (err) {
      next(err);
    }
  };
};
