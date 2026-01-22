# @nen/auth

Shared authentication utilities and middleware for the nEn platform.

## Features

- **JWT Authentication**: Token verification and signing
- **Auth Middleware**: Express middleware for protected routes
- **Error Handling**: Custom error classes and async handler
- **API Response**: Standardized response format

## Usage

### Auth Middleware

```typescript
import express from "express";
import { createAuthMiddleware, asyncHandler } from "@nen/auth";

const app = express();

const authMiddleware = createAuthMiddleware({
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET!,
  cookieName: "accessToken", // optional, defaults to "accessToken"
});

// Protect routes
app.get("/protected", authMiddleware, asyncHandler(async (req, res) => {
  const user = req.user;
  res.json({ user });
}));
```

### Token Operations

```typescript
import { signToken, verifyToken } from "@nen/auth";

// Sign a token
const token = signToken(
  { id: "user-123", email: "user@example.com" },
  process.env.ACCESS_TOKEN_SECRET!,
  "7d"
);

// Verify a token
try {
  const decoded = verifyToken(token, process.env.ACCESS_TOKEN_SECRET!);
  console.log(decoded);
} catch (error) {
  console.error("Invalid token");
}
```

### Error Handling

```typescript
import { CustomError, ApiResponse, asyncHandler } from "@nen/auth";

app.get("/api/data", asyncHandler(async (req, res) => {
  const data = await fetchData();
  if (!data) {
    throw new CustomError(404, "Data not found");
  }
  res.json(new ApiResponse(200, "Success", data));
}));
```
