import type { Request, Response, NextFunction, RequestHandler } from "express";

export const asyncHandler =
  (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: (req: Request, res: Response, next: NextFunction) => Promise<any>
  ): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
