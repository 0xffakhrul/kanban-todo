import { UserRepository } from "../repositories/user.repository";
import { decode, sign, verify } from "hono/jwt";
import { AuthResponse, LoginInput, RegisterInput, User } from "../types/types";

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET!;
  private readonly REFRESH_SECRET = process.env.REFRESH_SECRET!;
  private readonly ACCESS_TOKEN_EXPIRATION = 15 * 60; // 15 minutes
  private readonly REFRESH_TOKEN_EXPIRATION = 7 * 24 * 60 * 60; // 7 days

  constructor(private userRepo: UserRepository) {}

  private async hashPassword(password: string): Promise<string> {
    return await Bun.password.hash(password);
  }

  private async verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await Bun.password.verify(password, hashedPassword);
  }

  private async generateAccessToken(userId: string): Promise<string> {
    const payload = {
      sub: userId,
      type: "access",
      exp: Math.floor(Date.now() / 1000) + this.ACCESS_TOKEN_EXPIRATION,
    };

    return await sign(payload, this.JWT_SECRET);
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const payload = {
      sub: userId,
      type: "refresh",
      exp: Math.floor(Date.now() / 1000) + this.REFRESH_TOKEN_EXPIRATION,
    };

    return await sign(payload, this.REFRESH_SECRET);
  }

  async verifyAccessToken(token: string): Promise<string | null> {
    try {
      const payload = await verify(token, this.JWT_SECRET);
      if (payload.type !== "access") {
        return null;
      }
      return payload.sub as string;
    } catch (error) {
      return null;
    }
  }

  async verifyRefreshToken(token: string): Promise<string | null> {
    try {
      const payload = await verify(token, this.REFRESH_SECRET);
      if (payload.type !== "refresh") {
        return null;
      }
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
      data.name.trim()
    );

    const accessToken = await this.generateAccessToken(user.id);
    const refreshToken = await this.generateRefreshToken(user.id);

    return { user, accessToken, refreshToken };
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

    const { password, ...user } = userWithPassword;

    const accessToken = await this.generateAccessToken(user.id);
    const refreshToken = await this.generateRefreshToken(user.id);

    return { user, accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    const userId = await this.verifyRefreshToken(refreshToken);
    if (!userId) {
      throw new Error("Invalid refresh token");
    }

    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return await this.generateAccessToken(user.id);
  }

  async getCurrentUser(userId: string): Promise<User> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
}
