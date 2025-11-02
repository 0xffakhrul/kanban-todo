import { Hono } from "hono";
import { StatusController } from "../controllers/status.controller";
import { TodoController } from "../controllers/todo.controller";
import { BoardController } from "../controllers/board.controller";
import { AuthController } from "../controllers/auth.controller";
import { createAuthMiddleware } from "../middleware/auth.middleware";
import { AuthService } from "../services/auth.service";

export function createAuthRoutes(
  authController: AuthController,
  authService: AuthService
) {
  const routes = new Hono();

  routes.post("/register", (c) => authController.register(c));
  routes.post("/login", (c) => authController.login(c));
  routes.post("/logout", (c) => authController.logout(c));
  routes.post("/refresh", (c) => authController.refresh(c));

  routes.use("/me", createAuthMiddleware(authService));
  routes.get("/me", (c) => authController.me(c));

  return routes;
}

export function createBoardRoutes(
  boardController: BoardController,
  authService: AuthService
) {
  const routes = new Hono();
  const authMiddleware = createAuthMiddleware(authService);

  routes.use("/*", authMiddleware);

  routes.post("/", (c) => boardController.createBoard(c));
  routes.get("/:id", (c) => boardController.getBoardById(c));

  return routes;
}

export function createStatusRoutes(
  statusController: StatusController,
  authService: AuthService
) {
  const routes = new Hono();
  const authMiddleware = createAuthMiddleware(authService);

  routes.use("/*", authMiddleware);

  // Nested routes: /api/v1/boards/:boardId/statuses
  routes.get("/boards/:boardId/statuses", (c) =>
    statusController.listByBoard(c)
  );
  routes.post("/boards/:boardId/statuses", (c) => statusController.create(c));

  // Direct status operations: /api/v1/statuses/:id
  routes.get("/statuses/:id", (c) => statusController.getById(c));
  routes.patch("/statuses/:id", (c) => statusController.update(c));
  routes.delete("/statuses/:id", (c) => statusController.delete(c));

  return routes;
}

export function createTodoRoutes(
  todoController: TodoController,
  authService: AuthService
) {
  const routes = new Hono();
  const authMiddleware = createAuthMiddleware(authService);

  routes.use("/*", authMiddleware);

  // Nested routes: /api/v1/boards/:boardId/todos
  routes.get("/boards/:boardId/todos", (c) => todoController.listByBoard(c));
  routes.post("/boards/:boardId/todos", (c) => todoController.create(c));

  // Direct todo operations: /api/v1/todos/:id
  routes.patch("/todos/:id", (c) => todoController.update(c));
  routes.delete("/todos/:id", (c) => todoController.delete(c));

  return routes;
}
