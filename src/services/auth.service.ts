import { UserRespository } from "../repositories/user.repository";
import { decode, sign, verify } from "hono/jwt";
import { AuthResponse, LoginInput, RegisterInput, User } from "../types/types";

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET!;
  private readonly JWT_EXPIRES_IN = "7d";

  constructor(private userRepo: UserRespository) {}

  private async hashPassword(password: string): Promise<string> {
    return await Bun.password.hash(password);
  }

  private async verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await Bun.password.verify(password, hashedPassword);
  }

  private async generateToken(userId: string): Promise<string> {
    const payload = {
      sub: userId,
      exp: Math.floor(Date.now() / 10000) + 60 * 60 * 24 * 7,
    };

    return await sign(payload, this.JWT_SECRET);
  }

  async verifyToken(token: string): Promise<string | null> {
    try {
      const payload = await verify(token, this.JWT_SECRET);
      return payload.sub as string;
    } catch (error) {
      return null;
    }
  }

  async register(data: RegisterInput): Promise<AuthResponse> {
    const existingUser = await this.userRepo.findByEmail(data.email);
    if (existingUser) {
      throw new Error("Email already registered");
    }

    const hashedPassword = await this.hashPassword(data.password);

    const user = await this.userRepo.create(
      data.email.toLowerCase().trim(),
      hashedPassword,
      data.name?.trim()
    );

    const token = await this.generateToken(user.id);

    return { user, token };
  }

  async login(data: LoginInput): Promise<AuthResponse> {
    // find user
    const userWithPassword = await this.userRepo.findByEmail(
      data.email.toLowerCase()
    );

    if (!userWithPassword) {
      throw new Error("Invalid email or password");
    }

    // verify password
    const isValid = await this.verifyPassword(
      data.password,
      userWithPassword.password
    );
    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    const user = await this.userRepo.findById(userWithPassword.id);
    if (!user) {
      throw new Error("user not found");
    }

    const token = await this.generateToken(user.id);

    return { user, token };
  }

  async getCurrentUser(userId: string): Promise<User> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
}
