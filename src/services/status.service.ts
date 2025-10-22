import { StatusRepository } from "../repositories/status.repository";
import { TodoRepository } from "../repositories/todo.repository";
import { CreateStatusInput, Status, UpdateStatusInput } from "../types/types";

export class StatusService {
  constructor(
    private statusRepo: StatusRepository,
    private todoRepo: TodoRepository
  ) {}

  async createStatus(userId: string, name: string): Promise<Status> {
    const data: CreateStatusInput = {
      userId,
      name: name.trim(),
    };

    return await this.statusRepo.create(data);
  }

  async getStatusById(id: string, userId: string): Promise<Status> {
    const status = await this.statusRepo.findById(id);

    if (!status) {
      throw new Error("status not found");
    }

    if (status.userId !== userId) {
      throw new Error("access denied");
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
}
