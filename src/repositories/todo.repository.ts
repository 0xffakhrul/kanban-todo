import { eq } from "drizzle-orm";
import { db } from "../db/connection";
import { statuses, todos } from "../db/schema";
import { CreateTodoInput, Todo, TodoWithStatus, UpdateTodoInput } from "../types/types";

export class TodoRepository {
  async create(data: CreateTodoInput): Promise<Todo> {
    const [todo] = await db
      .insert(todos)
      .values({
        title: data.title,
        description: data.description || null,
        statusId: data.statusId,
        userId: data.userId,
      })
      .returning();

    return todo as Todo;
  }

  async update(id: string, data: UpdateTodoInput): Promise<Todo> {
    const [updated] = await db
      .update(todos)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(todos.id, id))
      .returning();

    return updated as Todo;
  }

  async findById(id: string): Promise<Todo | null> {
    const [todo] = await db
      .select()
      .from(todos)
      .where(eq(todos.id, id))
      .limit(1);

    return (todo as Todo) || null;
  }

  async findByIdWithStatus(id: string): Promise<TodoWithStatus | null> {
    const [result] = await db
      .select()
      .from(todos)
      .leftJoin(statuses, eq(todos.statusId, statuses.id))
      .where(eq(todos.id, id))
      .limit(1);

    if (!result) return null;

    return {
      ...result.todos,
      status: result.statuses!,
    } as TodoWithStatus;
  }

  async delete(id: string): Promise<void> {
    await db.delete(todos).where(eq(todos.id, id));
  }
}
