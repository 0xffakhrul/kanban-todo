import { Context, Next } from "hono";
import { AuthService } from "../services/auth.service";
import { getCookie } from "hono/cookie";

export function createAuthMiddleware(authService: AuthService) {
  return async (c: Context, next: Next) => {
    const accessToken = getCookie(c, "access_token");
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }

    const userId = await authService.verifyAccessToken(accessToken);
    if (!userId) {
      return c.json({ error: "Invalid or expired token" }, 401);
    }

    c.set("userId", userId);
    await next();
  };
}
