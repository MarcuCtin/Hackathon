// extend Express namespace for typed userId on req

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export {};
