import { z } from "zod";

export const registerSchema = z.object({
  email: z.email("Invalid email!"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2).max(100),
});

export const loginSchema = z.object({
  email: z.email("Invalid email!"),
  password: z.string().min(1, "Password is required"),
});

export const createStatusSchema = z.object({
  name: z.string().min(1).max(50),
  userId: z.uuid(),
});

export const updateStatusSchema = z.object({
  name: z.string().min(1).max(50).optional(),
});

export const createTodoSchema = z.object({
  title: z.string().min(3).max(50),
  description: z.string().min(1).max(500).optional(),
  statusId: z.uuid("Invalid status ID"),
});

export const updateTodoSchema = z.object({
  title: z.string().min(3).max(50).optional(),
  description: z.string().max(500).optional(),
  statusId: z.uuid("Invalid status ID").optional(),
});
