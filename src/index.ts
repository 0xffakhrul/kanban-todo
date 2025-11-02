import { Hono } from "hono";
import { StatusRepository } from "./repositories/status.repository";
import { TodoRepository } from "./repositories/todo.repository";
import { BoardRepository } from "./repositories/board.repository";
import { UserRepository } from "./repositories/user.repository";
import { StatusService } from "./services/status.service";
import { TodoService } from "./services/todo.service";
import { BoardService } from "./services/board.service";
import { AuthService } from "./services/auth.service";
import { StatusController } from "./controllers/status.controller";
import { TodoController } from "./controllers/todo.controller";
import { BoardController } from "./controllers/board.controller";
import { AuthController } from "./controllers/auth.controller";
import {
  createAuthRoutes,
  createBoardRoutes,
  createStatusRoutes,
  createTodoRoutes,
} from "./routes/routes";
import { createAuthMiddleware } from "./middleware/auth.middleware";
import { cors } from "hono/cors";

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

const userRepository = new UserRepository();
const boardRepository = new BoardRepository();
const statusRepository = new StatusRepository();
const todoRepository = new TodoRepository();

const authService = new AuthService(userRepository);
const boardService = new BoardService(boardRepository);
const statusService = new StatusService(
  statusRepository,
  todoRepository,
  boardRepository
);
const todoService = new TodoService(
  todoRepository,
  statusRepository,
  boardRepository
);

const authController = new AuthController(authService);
const boardController = new BoardController(boardService);
const statusController = new StatusController(statusService);
const todoController = new TodoController(todoService);

// Register routes
app.route("/api/v1/auth", createAuthRoutes(authController, authService));
app.route("/api/v1/boards", createBoardRoutes(boardController, authService));
app.route("/api/v1", createStatusRoutes(statusController, authService));
app.route("/api/v1", createTodoRoutes(todoController, authService)); 
export default app;
