import type { NextFunction, Request, Response } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";

export interface DecodedUser {
  id: string;
  email?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      user?: DecodedUser;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

export class AuthError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export interface AuthMiddlewareConfig {
  accessTokenSecret: string;
  cookieName?: string;
}

export function createAuthMiddleware(config: AuthMiddlewareConfig) {
  const cookieName = config.cookieName || "accessToken";

  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.[cookieName];
    
    if (!token) {
      throw new AuthError(401, "No access token provided");
    }

    try {
      const decoded = jwt.verify(token, config.accessTokenSecret);
      req.user = decoded as DecodedUser;
      next();
    } catch (error: unknown) {
      if (error instanceof TokenExpiredError) {
        throw new AuthError(401, "Token expired");
      }
      throw new AuthError(401, "Invalid or expired token");
    }
  };
}

export function verifyToken(token: string, secret: string): DecodedUser {
  try {
    return jwt.verify(token, secret) as DecodedUser;
  } catch (error: unknown) {
    if (error instanceof TokenExpiredError) {
      throw new AuthError(401, "Token expired");
    }
    throw new AuthError(401, "Invalid token");
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function signToken(payload: any, secret: string, expiresIn: string = "7d"): string {
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}
