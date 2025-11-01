import { Hono } from "hono";
import { StatusRepository } from "./repositories/status.repository";
import { TodoRepository } from "./repositories/todo.repository";
import { StatusService } from "./services/status.service";
import { TodoService } from "./services/todo.service";
import { StatusController } from "./controllers/status.controller";
import { TodoController } from "./controllers/todo.controller";
import {
  createAuthRoutes,
  createStatusRoutes,
  createTodoRoutes,
} from "./routes/routes";
import { AuthService } from "./services/auth.service";
import { UserRepository } from "./repositories/user.repository";
import { AuthController } from "./controllers/auth.controller";
import { createAuthMiddleware } from "./middleware/auth.middleware";
import { cors } from "hono/cors";
import { serve } from "bun";

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// app.use(
//   "/*",
//   cors({
//     origin: "http://localhost:3000",
//     credentials: true,
//   })
// );

// serve({
//   fetch: app.fetch,
//   port: 3000,
//   hostname: "0.0.0.0",
// });

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

const userRepository = new UserRepository();
const statusRepository = new StatusRepository();
const todoRepository = new TodoRepository();

const authService = new AuthService(userRepository);
const statusService = new StatusService(statusRepository, todoRepository);
const todoService = new TodoService(todoRepository, statusRepository);

const authController = new AuthController(authService);
const statusController = new StatusController(statusService);
const todoController = new TodoController(todoService);

const authMiddleware = createAuthMiddleware(authService);

app.route("/api/v1/auth", createAuthRoutes(authController, authService));

// Register routes
app.route(
  "/api/v1/statuses",
  createStatusRoutes(statusController, authService)
);
app.route("/api/v1/todos", createTodoRoutes(todoController, authService));

export default app;
