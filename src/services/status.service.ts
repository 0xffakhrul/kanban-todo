import { StatusRepository } from "../repositories/status.repository";
import { BoardRepository } from "../repositories/board.repository";
import { CreateStatusInput, Status, UpdateStatusInput } from "../types/types";
import { HTTPException } from "hono/http-exception";
import { TodoRepository } from "../repositories/todo.repository";

export class StatusService {
  constructor(
    private statusRepo: StatusRepository,
    private todoRepo: TodoRepository,
    private boardRepo: BoardRepository,
  ) {}

  async createStatus(
    userId: string,
    boardId: string,
    name: string
  ): Promise<Status> {
    const board = await this.boardRepo.findById(boardId);
    if (!board) {
      throw new HTTPException(404, { message: "Board not found" });
    }
    if (board.userId !== userId) {
      throw new HTTPException(403, { message: "Access denied" });
    }

    const exists = await this.statusRepo.existsByNameForBoard(name, boardId);
    if (exists) {
      throw new HTTPException(409, {
        message: "Status name already exists in this board",
      });
    }

    const data: CreateStatusInput = {
      userId,
      boardId,
      name: name.trim(),
    };

    return await this.statusRepo.create(data);
  }

  async getStatusById(id: string, userId: string): Promise<Status> {
    const status = await this.statusRepo.findById(id);

    if (!status) {
      throw new HTTPException(404, { message: "Status not found" });
    }

    if (status.userId !== userId) {
      throw new HTTPException(403, { message: "Access denied" });
    }

    return status;
  }

  async updateStatus(
    id: string,
    userId: string,
    data: UpdateStatusInput
  ): Promise<Status> {
    await this.getStatusById(id, userId); 

    const sanitizedData: UpdateStatusInput = {};
    if (data.name) sanitizedData.name = data.name.trim();

    return await this.statusRepo.update(id, sanitizedData);
  }

  async deleteStatus(id: string, userId: string): Promise<void> {
    await this.getStatusById(id, userId); 
    await this.statusRepo.delete(id);
  }

  async getStatusesByBoard(
    boardId: string,
    userId: string
  ): Promise<Status[]> {
    const board = await this.boardRepo.findById(boardId);
    if (!board) {
      throw new HTTPException(404, { message: "Board not found" });
    }
    if (board.userId !== userId) {
      throw new HTTPException(403, { message: "Access denied" });
    }

    return await this.statusRepo.findByBoardId(boardId);
  }
}