import ms,{ type StringValue } from "ms";
import config from "@delegate/config";

interface CookieOptionsArgs {
  rememberMe?: boolean;
}

export function generateCookieOptions() {
  const expiry = "7d";
  return {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: config.nodeEnv === "production" ? "none" as const : "lax" as const,
    maxAge: ms(expiry as StringValue),
  };
}