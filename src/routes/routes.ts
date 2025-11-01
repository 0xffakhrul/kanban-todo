import { Hono } from "hono";
import { StatusController } from "../controllers/status.controller";
import { TodoController } from "../controllers/todo.controller";
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

  routes.use("/me", createAuthMiddleware(authService));
  routes.get("/me", (c) => authController.me(c));

  routes.post("/logout", (c) => authController.logout(c));
  routes.post("/refresh", (c) => authController.refresh(c));

  return routes;
}

export function createStatusRoutes(
  statusController: StatusController,
  authService: AuthService
) {
  const routes = new Hono();

  routes.use("/", createAuthMiddleware(authService));

  routes.get("/", (c) => statusController.list(c));
  routes.post("/", (c) => statusController.create(c));

  return routes;
}

export function createTodoRoutes(
  todoController: TodoController,
  authService: AuthService
) {
  const routes = new Hono();

  routes.use("*", createAuthMiddleware(authService));

  routes.get("/", (c) => todoController.list(c));
  routes.post("/", (c) => todoController.create(c));
  routes.put("/:id", (c) => todoController.update(c));

  return routes;
}
