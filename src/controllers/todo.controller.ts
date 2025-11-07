import { Context } from "hono";
import { TodoService } from "../services/todo.service";
import {
  createTodoSchema,
  updateTodoSchema,
} from "../validators/zod-validators";
import z from "zod";
import { HTTPException } from "hono/http-exception";

export class TodoController {
  constructor(private todoService: TodoService) {}

  async create(c: Context) {
    try {
      const userId = c.get("userId");
      const { boardId } = c.req.param(); 
      const body = await c.req.json();
      const validatedData = createTodoSchema.parse(body);

      const todo = await this.todoService.createTodo(
        userId,
        boardId,
        validatedData.statusId,
        validatedData.title,
        validatedData.description || undefined
      );

      return c.json(
        {
          success: true,
          data: todo,
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
      console.error("Error creating todo:", error);
      throw new HTTPException(500, { message: "Failed to create todo" });
    }
  }

  async update(c: Context) {
    try {
      const userId = c.get("userId");
      const { id } = c.req.param();
      const body = await c.req.json();
      const validatedData = updateTodoSchema.parse(body);

      const todo = await this.todoService.updateTodo(
        id,
        userId,
        validatedData
      );

      return c.json({
        success: true,
        data: todo,
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
      console.error("Error updating todo:", error);
      throw new HTTPException(500, { message: "Failed to update todo" });
    }
  }

  async delete(c: Context) {
    try {
      const userId = c.get("userId");
      const { id } = c.req.param();

      await this.todoService.deleteTodo(id, userId);

      return c.json({
        success: true,
        message: "Todo deleted successfully",
      });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      console.error("Error deleting todo:", error);
      throw new HTTPException(500, { message: "Failed to delete todo" });
    }
  }

  async listByBoard(c: Context) {
    try {
      const userId = c.get("userId");
      const boardId = c.req.param("boardId");

      const todos = await this.todoService.getTodosByBoard(boardId, userId);

      return c.json({
        success: true,
        data: todos,
      });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      console.error("Error fetching todos:", error);
      throw new HTTPException(500, { message: "Failed to fetch todos" });
    }
  }
}