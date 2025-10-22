import { Context } from "hono";
import { StatusService } from "../services/status.service";
import { createStatusSchema } from "../validators/zod-validators";
import z from "zod";
import { HTTPException } from "hono/http-exception";

export class StatusController {
  constructor(private statusService: StatusService) {}

  async create(c: Context) {
    try {
      const userId = c.get("userId");
      const body = await c.req.json();
      const validatedData = createStatusSchema.parse(body);

      const status = await this.statusService.createStatus(
        userId,
        validatedData.name
      );
      return c.json(status, 201);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json(
          { error: "Validation failed", details: error.issues },
          400
        );
      }

      if (error instanceof HTTPException) {
        return c.json({ error: error.message }, error.status);
      }

      return c.json({ error: (error as Error).message }, 400);
    }
  }

  async list(c: Context) {
    try {
      const userId = c.get("userId");
      const statuses = await this.statusService.getAllStatusesByUserId(userId);
      return c.json(statuses, 200);
    } catch (error) {
      return c.json({ error: (error as Error).message }, 400);
    }
  }
}
