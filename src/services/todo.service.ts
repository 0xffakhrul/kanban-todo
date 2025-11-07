import { StatusRepository } from "../repositories/status.repository";
import { TodoRepository } from "../repositories/todo.repository";
import { BoardRepository } from "../repositories/board.repository";
import {
  CreateTodoInput,
  TodoWithStatus,
  UpdateTodoInput,
} from "../types/types";
import { HTTPException } from "hono/http-exception";

export class TodoService {
  constructor(
    private todoRepo: TodoRepository,
    private statusRepo: StatusRepository,
    private boardRepo: BoardRepository
  ) {}

  async createTodo(
    userId: string,
    boardId: string,
    statusId: string,
    title: string,
    description?: string
  ): Promise<TodoWithStatus> {
    const board = await this.boardRepo.findById(boardId);
    if (!board) {
      throw new HTTPException(404, { message: "Board not found" });
    }
    if (board.userId !== userId) {
      throw new HTTPException(403, { message: "Access denied" });
    }

    const status = await this.statusRepo.findById(statusId);
    if (!status) {
      throw new HTTPException(404, { message: "Status not found" });
    }
    if (status.boardId !== boardId) {
      throw new HTTPException(400, {
        message: "Status does not belong to this board",
      });
    }

    const data: CreateTodoInput = {
      userId,
      boardId,
      statusId,
      title: title.trim(),
      description: description?.trim(),
    };

    const todo = await this.todoRepo.create(data);
    const todoWithStatus = await this.todoRepo.findByIdWithStatus(todo.id);
    return todoWithStatus!;
  }

  async updateTodo(
    todoId: string,
    userId: string,
    data: UpdateTodoInput
  ): Promise<TodoWithStatus> {
    const existingTodo = await this.todoRepo.findById(todoId);

    if (!existingTodo) {
      throw new HTTPException(404, { message: "Todo not found" });
    }

    if (existingTodo.userId !== userId) {
      throw new HTTPException(403, {
        message: "Unauthorized: You can only update your own todos",
      });
    }

    if (data.statusId && data.statusId !== existingTodo.statusId) {
      const status = await this.statusRepo.findById(data.statusId);
      if (!status) {
        throw new HTTPException(404, { message: "Status not found" });
      }
    }

    const updateData: UpdateTodoInput = {
      ...(data.title && { title: data.title.trim() }),
      ...(data.description !== undefined && {
        description: data.description?.trim() || null,
      }),
      ...(data.statusId && { statusId: data.statusId }),
    };

    await this.todoRepo.update(todoId, userId, updateData);
    const todoWithStatus = await this.todoRepo.findByIdWithStatus(todoId);

    if (!todoWithStatus) {
      throw new HTTPException(404, { message: "Todo not found after update" });
    }

    return todoWithStatus;
  }

  async getTodosByBoard(
    boardId: string,
    userId: string
  ): Promise<TodoWithStatus[]> {
    const board = await this.boardRepo.findById(boardId);
    if (!board) {
      throw new HTTPException(404, { message: "Board not found" });
    }
    if (board.userId !== userId) {
      throw new HTTPException(403, { message: "Access denied" });
    }

    return await this.todoRepo.findByBoardWithStatus(boardId);
  }

  async deleteTodo(todoId: string, userId: string): Promise<void> {
    const todo = await this.todoRepo.findById(todoId);

    if (!todo) {
      throw new HTTPException(404, { message: "Todo not found" });
    }

    if (todo.userId !== userId) {
      throw new HTTPException(403, { message: "Unauthorized" });
    }

    await this.todoRepo.delete(todoId);
  }
}
