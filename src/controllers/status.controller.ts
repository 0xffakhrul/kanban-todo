import { Context } from "hono";
import { StatusService } from "../services/status.service";
import {
  createStatusSchema,
  updateStatusSchema,
} from "../validators/zod-validators";
import z from "zod";
import { HTTPException } from "hono/http-exception";

export class StatusController {
  constructor(private statusService: StatusService) {}

  async create(c: Context) {
    try {
      const userId = c.get("userId");
      const boardId = c.req.param("boardId");
      const body = await c.req.json();
      const validatedData = createStatusSchema.parse(body);

      const status = await this.statusService.createStatus(
        userId,
        boardId,
        validatedData.name
      );

      return c.json(
        {
          success: true,
          data: status,
        },
        201
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new HTTPException(400, {
          message: "Validation failed",
          cause: error.issues,
        });
      }
      if (error instanceof HTTPException) {
        throw error;
      }
      console.error("Error creating status:", error);
      throw new HTTPException(500, { message: "Failed to create status" });
    }
  }

  async getById(c: Context) {
    try {
      const userId = c.get("userId");
      const { id } = c.req.param();

      const status = await this.statusService.getStatusById(id, userId);

      return c.json({
        success: true,
        data: status,
      });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      console.error("Error fetching status:", error);
      throw new HTTPException(500, { message: "Failed to fetch status" });
    }
  }

  async update(c: Context) {
    try {
      const userId = c.get("userId");
      const { id } = c.req.param();
      const body = await c.req.json();
      const validatedData = updateStatusSchema.parse(body);

      const status = await this.statusService.updateStatus(
        id,
        userId,
        validatedData
      );

      return c.json({
        success: true,
        data: status,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new HTTPException(400, {
          message: "Validation failed",
          cause: error.issues,
        });
      }
      if (error instanceof HTTPException) {
        throw error;
      }
      console.error("Error updating status:", error);
      throw new HTTPException(500, { message: "Failed to update status" });
    }
  }

  async delete(c: Context) {
    try {
      const userId = c.get("userId");
      const { id } = c.req.param();

      await this.statusService.deleteStatus(id, userId);

      return c.json({
        success: true,
        message: "Status deleted successfully",
      });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      console.error("Error deleting status:", error);
      throw new HTTPException(500, { message: "Failed to delete status" });
    }
  }

  async listByBoard(c: Context) {
    try {
      const userId = c.get("userId");
      const { boardId } = c.req.param();

      const statuses = await this.statusService.getStatusesByBoard(
        boardId,
        userId
      );

      return c.json({
        success: true,
        data: statuses,
      });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      console.error("Error fetching statuses:", error);
      throw new HTTPException(500, { message: "Failed to fetch statuses" });
    }
  }
}
