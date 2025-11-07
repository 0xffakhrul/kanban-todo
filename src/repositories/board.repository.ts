import { eq } from "drizzle-orm";
import { db } from "../db/connection";
import { boards } from "../db/schema";
import { Board, CreateBoardInput } from "../types/types";

export class BoardRepository {
  async create(data: CreateBoardInput): Promise<Board> {
    const boardValues = {
      name: data.name,
      icon: data.icon,
      userId: data.userId,
    };

    const [board] = await db.insert(boards).values(boardValues).returning();
    return board as Board;
  }

  async findById(id: string): Promise<Board | null> {
    const [board] = await db
      .select()
      .from(boards)
      .where(eq(boards.id, id))
      .limit(1);

    return (board as Board) || null;
  }

  async findByUserId(userId: string): Promise<Board[]> {
    const results = await db
      .select()
      .from(boards)
      .where(eq(boards.userId, userId));

    return results as Board[];
  }
}
