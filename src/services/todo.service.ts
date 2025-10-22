import { StatusRepository } from "../repositories/status.repository";
import { TodoRepository } from "../repositories/todo.repository";
import { CreateTodoInput, TodoWithStatus } from "../types/types";

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
}
