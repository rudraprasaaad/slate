import bcrypt from "bcryptjs";

const DEFAULT_SALT_ROUNDS: number = 10;

export class PasswordHasher {
  constructor(private readonly rounds: number = DEFAULT_SALT_ROUNDS) {}

  hash(password: string) {
    return bcrypt.hash(password, this.rounds);
  }

  verify(password: string, passwordHash: string) {
    return bcrypt.compare(password, passwordHash);
  }
}
