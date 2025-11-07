import { Context } from "hono";
import { BoardService } from "../services/board.service";
import { HTTPException } from "hono/http-exception";

export class BoardController {
  constructor(private boardService: BoardService) {}

  async createBoard(c: Context) {
    try {
      const userId = c.get("userId");
      const { name, icon } = await c.req.json();

      if (!name || name.trim().length === 0) {
        throw new HTTPException(400, { message: "Board name is required" });
      }

      const board = await this.boardService.createBoard(name, userId, icon);

      return c.json(
        {
          success: true,
          data: board,
        },
        201
      );
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      console.error("Error creating board:", error);
      throw new HTTPException(500, { message: "Failed to create board" });
    }
  }

  async getBoardById(c: Context) {
    try {
      const userId = c.get("userId");
      const { id } = c.req.param();

      const board = await this.boardService.getBoardById(id, userId);

      return c.json({
        success: true,
        data: board,
      });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      console.error("Error fetching board:", error);
      throw new HTTPException(500, { message: "Failed to fetch board" });
    }
  }

  async getBoardsByUserId(c: Context) {
    try {
      const userId = c.get("userId");
      const boards = await this.boardService.getBoardsByUserId(userId);

      return c.json({
        success: true,
        data: boards,
      });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      console.error("Error fetching boards:", error);
      throw new HTTPException(500, { message: "Failed to fetch boards" });
    }
  }
}
