export interface Status {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
}

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  statusId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TodoWithStatus extends Todo {
  status: Status;
}

export interface CreateStatusInput {
  name: string;
  userId: string;
}

export interface UpdateStatusInput {
  name?: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  statusId: string;
  userId: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  statusId?: string;
}
