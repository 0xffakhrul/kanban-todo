import { Context } from "hono";
import { AuthService } from "../services/auth.service";
import { loginSchema, registerSchema } from "../validators/zod-validators";
import z from "zod";
import { setCookie } from "hono/cookie";

export class AuthController {
  constructor(private authService: AuthService) {}

  async register(c: Context) {
    try {
      const body = await c.req.json();
      const validatedData = registerSchema.parse(body);

      const result = await this.authService.register(validatedData);

      setCookie(c, "auth_token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return c.json({ user: result.user }, 201);
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

      setCookie(c, "auth_token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 60 * 60 * 24 * 7, 
        path: "/",
      });

      return c.json({ user: result.user });
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

  async me(c: Context) {
    try {
      const userId = c.get("userId");
      const user = await this.authService.getCurrentUser(userId);

      return c.json({ user });
    } catch (error) {
      return c.json({ error: (error as Error).message }, 404);
    }
  }
}
