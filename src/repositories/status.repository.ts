import { and, eq } from "drizzle-orm";
import { db } from "../db/connection";
import { statuses } from "../db/schema";
import { CreateStatusInput, Status, UpdateStatusInput } from "../types/types";

export class StatusRepository {
  async create(data: CreateStatusInput): Promise<Status> {
    const [status] = await db
      .insert(statuses)
      .values({
        name: data.name,
        boardId: data.boardId,
        userId: data.userId,
      })
      .returning();
    return status as Status;
  }

  async findById(id: string): Promise<Status | null> {
    const [status] = await db
      .select()
      .from(statuses)
      .where(eq(statuses.id, id))
      .limit(1);
    return (status as Status) || null;
  }

  async update(id: string, data: UpdateStatusInput): Promise<Status> {
    const [updated] = await db
      .update(statuses)
      .set(data)
      .where(eq(statuses.id, id))
      .returning();
    return updated as Status;
  }

  async delete(id: string): Promise<void> {
    await db.delete(statuses).where(eq(statuses.id, id));
  }

  async existsByNameForBoard(name: string, boardId: string): Promise<boolean> {
    const [status] = await db
      .select()
      .from(statuses)
      .where(and(eq(statuses.name, name), eq(statuses.boardId, boardId)))
      .limit(1);
    return !!status;
  }

  async findByBoardId(boardId: string): Promise<Status[]> {
    const results = await db
      .select()
      .from(statuses)
      .where(eq(statuses.boardId, boardId));
    return results as Status[];
  }

  async findByUserId(userId: string): Promise<Status[]> {
    const results = await db
      .select()
      .from(statuses)
      .where(eq(statuses.userId, userId));
    return results as Status[];
  }
}