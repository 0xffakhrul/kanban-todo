import { HTTPException } from "hono/http-exception";
import { BoardRepository } from "../repositories/board.repository";
import { StatusRepository } from "../repositories/status.repository";
import { TodoRepository } from "../repositories/todo.repository";
import { Board, CreateBoardInput } from "../types/types";

export class BoardService {
  constructor(private boardRepo: BoardRepository) {}

  async createBoard(
    name: string,
    userId: string,
    icon: string
  ): Promise<Board> {
    const data: CreateBoardInput = {
      name: name.trim(),
      icon,
      userId,
    };

    return await this.boardRepo.create(data);
  }

  async getBoardById(id: string, userId: string): Promise<Board> {
    const board = await this.boardRepo.findById(id);

    if (!board) {
      throw new HTTPException(404, { message: "Board not found" });
    }

    if (board.userId !== userId) {
      throw new HTTPException(403, { message: "Access denied" });
    }

    return board;
  }

  async getBoardsByUserId(userId: string): Promise<Board[]> {
    const boards = await this.boardRepo.findByUserId(userId);
    return boards;
  }
}
