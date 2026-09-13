import type { LoginInput, SignupInput, UserDTO } from "@slate/contracts";
import type { PasswordHasher } from "../../lib/password-hasher";
import type { UserRepository } from "./user-repository";
import { HttpError } from "../../lib/http-error";

export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly passwords: PasswordHasher,
  ) {}

  async signup(input: SignupInput): Promise<UserDTO> {
    const email = input.email.toLowerCase().trim();
    const existing = await this.users.findByEmail(email);

    if (existing)
      throw new HttpError(
        409,
        "EMAIL_TAKEN",
        "That email is already registered",
      );

    return this.users.create({
      email,
      name: input.name.trim(),
      passwordHash: await this.passwords.hash(input.password),
    });
  }

  async login(input: LoginInput): Promise<UserDTO> {
    const email = input.email.toLowerCase().trim();
    const user = await this.users.findByEmail(email);

    if (
      !user ||
      !(await this.passwords.verify(input.password, user.passwordHash))
    ) {
      throw new HttpError(
        401,
        "INVALID_CREDENTIALS",
        "Email or password is wrong",
      );
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  getById(id: string) {
    return this.users.findById(id);
  }
}
