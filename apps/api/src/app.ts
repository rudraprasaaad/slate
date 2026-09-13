import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { db } from "./db/index";
import { PasswordHasher } from "./lib/password-hasher";
import { SessionService } from "./lib/session-service";
import { AuthRouter } from "./modules/auth/auth-router";
import { AuthService } from "./modules/auth/auth-service";
import { UserRepository } from "./modules/auth/user-repository";
import { errorHandler } from "./middleware/error-handler";

export function createApp() {
  const users = new UserRepository(db);
  const passwords = new PasswordHasher();
  const sessions = new SessionService(
    env.SESSION_SECRET,
    env.NODE_ENV === "production",
  );
  const auth = new AuthService(users, passwords);
  const authRouter = new AuthRouter(auth, sessions);

  const app = express();
  app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/auth", authRouter.router);
  app.use(errorHandler);
  return app;
}
