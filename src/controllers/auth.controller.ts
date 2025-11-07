import { Context } from "hono";
import { AuthService } from "../services/auth.service";
import { loginSchema, registerSchema } from "../validators/zod-validators";
import z from "zod";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

export class AuthController {
  constructor(private authService: AuthService) {}

  async register(c: Context) {
    try {
      const body = await c.req.json();
      const validatedData = registerSchema.parse(body);

      const result = await this.authService.register(validatedData);

      setCookie(c, "access_token", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 60 * 15, // 15 minutes
        path: "/",
      });

      setCookie(c, "refresh_token", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return c.json(
        {
          success: true,
          data: { user: result.user },
        },
        201
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json(
          { error: "Validation failed", details: error.issues },
          400
        );
      }
      return c.json({ error: (error as Error).message }, 400);
    }
  }

  async login(c: Context) {
    try {
      const body = await c.req.json();
      const validatedData = loginSchema.parse(body);

      const result = await this.authService.login(validatedData);

      setCookie(c, "access_token", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 60 * 15,
        path: "/",
      });

      setCookie(c, "refresh_token", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return c.json({
        success: true,
        data: { user: result.user },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json(
          { error: "Validation failed", details: error.issues },
          400
        );
      }
      return c.json({ error: (error as Error).message }, 401);
    }
  }

  async logout(c: Context) {
    // Clear both cookies
    deleteCookie(c, "access_token", { path: "/" });
    deleteCookie(c, "refresh_token", { path: "/" });

    return c.json({ message: "Logged out successfully" });
  }

  async refresh(c: Context) {
    try {
      const refreshToken = getCookie(c, "refresh_token");
      if (!refreshToken) {
        return c.json({ error: "Refresh token not found" }, 401);
      }

      const newAccessToken = await this.authService.refreshAccessToken(
        refreshToken
      );

      setCookie(c, "access_token", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 60 * 15, // 15 minutes
        path: "/",
      });

      return c.json({ message: "Token refreshed successfully" });
    } catch (error) {
      return c.json({ error: (error as Error).message }, 400);
    }
  }

  async me(c: Context) {
    try {
      const userId = c.get("userId");
      const user = await this.authService.getCurrentUser(userId);

      return c.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      return c.json({ error: (error as Error).message }, 404);
    }
  }
}
