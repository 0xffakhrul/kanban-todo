import { Context, Next } from "hono";
import { AuthService } from "../services/auth.service";
import { getCookie } from "hono/cookie";

export function createAuthMiddleware(authService: AuthService) {
  return async (c: Context, next: Next) => {
    let token = getCookie(c, "auth_token");

    if (!token) {
      const authHeader = c.req.header("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userId = await authService.verifyToken(token);

    if (!userId) {
      return c.json({ error: "Invalid or expired token" }, 401);
    }

    c.set("userId", userId);
    await next();
  };
}
