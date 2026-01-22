import type { Request, RequestHandler, Response } from "express";
import { ApiResponse, asyncHandler, CustomError } from "@delegate/auth";
import config from "@delegate/config";
import { authService } from "../services/index.js";
import { generateCookieOptions } from "../config/cookie";

export const signup: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    try {
      const userId = await authService.signup(email, password, name);

      res
        .status(201)
        .json(new ApiResponse(201, "User created successfully", userId));
    } catch (error: any) {
      if (error.message === "User already exists") {
        throw new CustomError(400, error.message);
      }
      throw new CustomError(500, "Failed to create user");
    }
  }
);

export const signin: RequestHandler = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError(400, "Email and password are required");
  }

  try {
    const { user, accessToken, refreshToken } = await authService.signin(email, password);

    res
      .status(200)
      .cookie("accessToken", accessToken, generateCookieOptions())
      .cookie("refreshToken", refreshToken, generateCookieOptions())
      .json(new ApiResponse(200, "Login successful", user));
  } catch (error: any) {
    throw new CustomError(400, error.message || "Invalid email or password");
  }
});

export const signout: RequestHandler = asyncHandler(async (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json(new ApiResponse(200, "Logged out successfully", null));
});
export const logout = signout;

export const getUser: RequestHandler = asyncHandler(
  async (req: Request, res) => {
    const userId = req.user.id;
    if (!userId) throw new CustomError(400, "user not found ");

    try {
      const user = await authService.getUserById(userId);

      res.status(200).json(new ApiResponse(200, "User fetched", user));
    } catch (error: any) {
      throw new CustomError(404, error.message || "User not found");
    }
  }
);

export const verifyGoogleToken = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    throw new CustomError(400, "No credential provided");
  }

  try {
    const { user, accessToken, refreshToken } = await authService.verifyGoogleToken(credential);

    res.cookie("accessToken", accessToken, generateCookieOptions());
    res.cookie("refreshToken", refreshToken, generateCookieOptions());

    res.status(200).json(
      new ApiResponse(200, "Google authentication successful", { user })
    );
  } catch (error: any) {
    logger.error("Google token verification failed", { error: error.message || error });
    throw new CustomError(401, "Invalid Google token");
  }
});

export const signInWithGoogle = asyncHandler(async (req, res) => {
  const url = authService.getGoogleAuthUrl();
  res.redirect(url);
});

export const handleSignInCallback = asyncHandler(async (req, res) => {
  const code = req.query.code as string;
  const userId = req.user.id;

  const createdCred = await authService.handleGoogleCallback(code, userId);

  res.redirect(config.backend.frontendUrl);
  res.status(200).json(new ApiResponse(200, "Google account connected", createdCred));
});
