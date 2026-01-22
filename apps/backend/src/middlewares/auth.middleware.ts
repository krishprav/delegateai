import type { NextFunction, Request, Response } from "express";
import { CustomError } from "@delegate/auth";
import config from "@delegate/config";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import dotenv from "dotenv";
import type { decodedUser } from "../../types";

dotenv.config();
export const isLoggedIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { accessToken } = req.cookies;
  if (!accessToken) throw new CustomError(404, "No Access token in middleware");

  try {
    const decoded = jwt.verify(accessToken, config.auth.accessTokenSecret);
    req.user = decoded as decodedUser;
    next();
  } catch (error:any) {
    if (error instanceof TokenExpiredError) {
      throw new CustomError(401, error.message);
    }
    throw new CustomError(401, "Invalid or expired token");
  }
};
