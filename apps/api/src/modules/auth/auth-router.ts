import { Router, type Request, type Response } from "express";
import type { AuthService } from "./auth-service";
import type { SessionService } from "../../lib/session-service";
import { asyncHandler } from "../../middleware/async-handler";
import { loginInput, signupInput } from "@slate/contracts";

export class AuthRouter {
  readonly router = Router();
  constructor(
    private readonly auth: AuthService,
    private readonly sessions: SessionService,
  ) {
    this.router.post("/signup", asyncHandler(this.signup));
    this.router.post("/login", asyncHandler(this.login));
    this.router.post("/logout", this.logout);
    this.router.get("/me", asyncHandler(this.me));
  }

  private signup = async (req: Request, res: Response) => {
    const input = signupInput.parse(req.body);
    const user = await this.auth.signup(input);
    await this.sessions.set(res, user.id);

    res.status(201).json({ user });
  };

  private login = async (req: Request, res: Response) => {
    const input = loginInput.parse(req.body);
    const user = await this.auth.login(input);
    await this.sessions.set(res, user.id);
    res.json({
      user,
    });
  };

  private logout = async (req: Request, res: Response) => {
    this.sessions.clear(res);
    res.json({
      ok: true,
    });
  };

  private me = async (req: Request, res: Response) => {
    const userId = await this.sessions.readUserId(req);
    const user = userId ? await this.auth.getById(userId) : null;
    res.json({ user });
  };
}
