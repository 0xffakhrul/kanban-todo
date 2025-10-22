import { Context } from "hono";
import { TodoService } from "../services/todo.service";
import { createTodoSchema } from "../validators/zod-validators";
import z from "zod";

export class TodoController {
  constructor(private todoService: TodoService) {}

  async create(c: Context) {
    try {
      const userId = c.get("userId");
      const body = await c.req.json();
      const validatedData = createTodoSchema.parse(body);

      const todo = await this.todoService.createTodo(
        userId,
        validatedData.title,
        validatedData.statusId,
        validatedData.description
      );
      return c.json(todo, 201);
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
}
