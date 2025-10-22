import { Hono } from "hono";
import { StatusController } from "../controllers/status.controller";
import { TodoController } from "../controllers/todo.controller";
import { AuthController } from "../controllers/auth.controller";

export function createAuthRoutes(authController: AuthController) {
  const routes = new Hono();

  routes.post("/register", (c) => authController.register(c));
  routes.post("/login", (c) => authController.login(c));
  routes.get("/me", (c) => authController.me(c));

  return routes;
}

export function createStatusRoutes(statusController: StatusController) {
  const routes = new Hono();

  routes.post("/", (c) => statusController.create(c));

  return routes;
}

export function createTodoRoutes(todoController: TodoController) {
  const routes = new Hono();

  routes.post("/", (c) => todoController.create(c));

  return routes;
}
