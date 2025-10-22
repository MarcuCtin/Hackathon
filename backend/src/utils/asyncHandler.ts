import type { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export const asyncHandler = (fn: AsyncHandler): RequestHandler => {
  return (req, res, next) => {
    void fn(req, res, next).catch(next);
  };
};
