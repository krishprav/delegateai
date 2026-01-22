import { prisma } from "@delegate/db";
import jwt from "jsonwebtoken";
import ms, { type StringValue } from "ms";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import config from "@delegate/config";
import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  config.auth.googleClientId,
  config.auth.googleClientSecret,
  `${config.backend.publicApiUrl}/api/v1/auth/google/callback`
);

export class AuthService {
  createHash(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  async comparePasswords(enteredPassword: string, storedPassword: string) {
    return bcrypt.compare(enteredPassword, storedPassword);
  }

  generateAccessToken(user: any) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      config.auth.accessTokenSecret,
      { expiresIn: config.auth.accessTokenExpiry as StringValue }
    );
  }

  generateRefreshToken(user: any) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      config.auth.refreshTokenSecret,
      { expiresIn: config.auth.refreshTokenExpiry as StringValue }
    );
  }

  async signup(email: string, password: string, name: string) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("User already exists");
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash: password,
        name,
        lastLoggedId: new Date(),
      },
    });

    return newUser.id;
  }

  async signin(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = password === user.passwordHash;
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    const hashedRefreshToken = this.createHash(refreshToken);
    const expiresAt = new Date(
      Date.now() + ms(config.auth.refreshTokenExpiry as StringValue)
    );

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { refreshToken: hashedRefreshToken, refreshTokenExpiry: expiresAt },
    });

    return {
      user: updatedUser,
      accessToken,
      refreshToken,
    };
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async verifyGoogleToken(credential: string) {
    const ticket = await oauth2Client.verifyIdToken({
      idToken: credential,
      audience: config.auth.googleClientId,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      throw new Error("Invalid token payload");
    }

    console.log("Verifying Google token for email:", payload.email);

    let user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    console.log("User found:", !!user);

    if (!user) {
      const name = payload.name || `${payload.given_name || ""} ${payload.family_name || ""}`.trim();

      user = await prisma.user.create({
        data: {
          email: payload.email,
          name: name || undefined,
          passwordHash: "",
          lastLoggedId: new Date(),
        },
      });
    } else {
      const updateData: any = { lastLoggedId: new Date() };

      if (!user.name && payload.name) {
        updateData.name = payload.name;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      accessToken,
      refreshToken,
    };
  }

  getGoogleAuthUrl() {
    const SCOPES = [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://mail.google.com/",
      "https://www.googleapis.com/auth/userinfo.email",
    ];

    return oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      prompt: "consent",
    });
  }

  async handleGoogleCallback(code: string, userId: string) {
    const { tokens } = await oauth2Client.getToken(code);

    const createdCred = await prisma.userCredentials.create({
      data: {
        name: "Google Account",
        apiName: "gmailOAuth2",
        appIcon:
          "https://ssl.gstatic.com/ui/v1/icons/mail/rfr/logo_gmail_lockup_default_1x_r2.png",
        application: "google",
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        data: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expiry_date: tokens.expiry_date,
          id_token: tokens.id_token,
        },
      },
    });

    return createdCred;
  }
}

export const authService = new AuthService();
