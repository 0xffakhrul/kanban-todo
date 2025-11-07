export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface Board {
  id: string;
  name: string;
  userId: string;
  icon: string;
  createdAt: Date;
}

export interface Status {
  id: string;
  name: string;
  boardId: string;
  userId: string;
  createdAt: Date;
}

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  boardId: string;
  statusId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TodoWithStatus extends Todo {
  status: Status;
}

export interface RegisterInput {
  email: string;
  name: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface CreateBoardInput {
  name: string;
  userId: string;
  icon: string;
}

export interface UpdateBoardInput {
  name?: string;
  icon?: string;
}

export interface CreateStatusInput {
  name: string;
  boardId: string;
  userId: string;
}

export interface UpdateStatusInput {
  name?: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  boardId: string;
  statusId: string;
  userId: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string | null;
  statusId?: string;
}
