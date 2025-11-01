import { StatusRepository } from "../repositories/status.repository";
import { TodoRepository } from "../repositories/todo.repository";
import {
  CreateTodoInput,
  TodoWithStatus,
  UpdateTodoInput,
} from "../types/types";

export class TodoService {
  constructor(
    private todoRepo: TodoRepository,
    private statusRepo: StatusRepository
  ) {}

  async createTodo(
    userId: string,
    title: string,
    statusId: string,
    description?: string
  ): Promise<TodoWithStatus> {
    const data: CreateTodoInput = {
      userId,
      title: title.trim(),
      description: description?.trim(),
      statusId,
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
      throw new Error("Todo not found");
    }

    if (existingTodo.userId !== userId) {
      throw new Error("Unauthorized: You can only update your own todos");
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
      throw new Error("Todo not found after update");
    }

    return todoWithStatus;
  }

  async getTodosByUser(userId: string): Promise<TodoWithStatus[]> {
    return this.todoRepo.findByUserWithStatus(userId);
  }
}
