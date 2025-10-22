import { eq } from "drizzle-orm";
import { db } from "../db/connection";
import { users } from "../db/schema";
import { User } from "../types/types";

export class UserRepository {
  async create(
    email: string,
    hashedPassword: string,
    name: string
  ): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        name: name,
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        createdAt: users.createdAt,
      });

    return user as User;
  }

  async findByEmail(email: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user;
  }

  async findById(id: string): Promise<User | null> {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return (user as User) || null;
  }
}
