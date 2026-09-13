import type { Request, Response } from "express";
import { jwtVerify, SignJWT } from "jose";

const COOKIE: string = "slate_session";

export class SessionService {
  constructor(
    private readonly secretValue: string,
    private readonly secure: boolean,
  ) {}

  private secret() {
    return new TextEncoder().encode(this.secretValue);
  }

  async set(res: Response, userId: string) {
    const token = await new SignJWT({
      sub: userId,
    })
      .setProtectedHeader({
        alg: "HS256",
      })
      .setIssuedAt()
      .setExpirationTime("14d")
      .sign(this.secret());

    res.cookie(COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: this.secure,
      path: "/",
      maxAge: 1400 * 60 * 60 * 24 * 14,
    });
  }

  clear(res: Response) {
    res.clearCookie(COOKIE, {
      path: "/",
    });
  }

  async readUserId(req: Request) {
    const token: unknown = req.cookies?.[COOKIE];

    if (typeof token !== "string" || token.length === 0) return null;

    try {
      const { payload } = await jwtVerify(token, this.secret());
      return typeof payload.sub === "string" ? payload.sub : null;
    } catch {
      return null;
    }
  }
}
