import type { PasswordHasher } from "../../lib/password-hasher";
import { AuthService } from "./auth-service";
import type { UserRepository } from "./user-repository";
import { describe, expect, it } from "vitest";
import type { HttpError } from "../../lib/http-error";

type StoredUser = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
};

class FakeUsers {
  private rows = new Map<string, StoredUser>();

  findByEmail(email: string) {
    return Promise.resolve(
      [...this.rows.values()].find((row) => row.email === email) ?? undefined,
    );
  }

  findById(id: string) {
    const row = this.rows.get(id);
    if (!row) return Promise.resolve(undefined);
    return Promise.resolve({ id: row.id, email: row.email, name: row.name });
  }

  create(input: { email: string; name: string; passwordHash: string }) {
    const user: StoredUser = {
      id: "user_1",
      email: input.email,
      name: input.name,
      passwordHash: input.passwordHash,
    };

    this.rows.set(user.id, user);
    return Promise.resolve({ id: user.id, email: user.email, name: user.name });
  }
}

class FakePasswords implements Pick<PasswordHasher, "hash" | "verify"> {
  hash(password: string) {
    return Promise.resolve(`hashed:${password}`);
  }

  verify(password: string, passwordHash: string): Promise<boolean> {
    return Promise.resolve(passwordHash === `hashed:${password}`);
  }
}

function createService(users = new FakeUsers()) {
  return {
    users,
    auth: new AuthService(
      users as unknown as UserRepository,
      new FakePasswords() as PasswordHasher,
    ),
  };
}

describe("AuthService", () => {
  it("signs up a new user and hashes the password", async () => {
    const { auth, users } = createService();

    const user = await auth.signup({
      email: "abc@slate.dev",
      name: " Abc ",
      password: "password12",
    });

    expect(user).toEqual({
      id: "user_1",
      email: "abc@slate.dev",
      name: "Abc",
    });

    const stored = await users.findByEmail("abc@slate.dev");
    expect(stored?.passwordHash).toBe("hashed:password12");
  });

  it("rejects a taken email", async () => {
    const { auth } = createService();

    await auth.signup({
      email: "abc.slate@dev",
      name: "Abc",
      password: "password12",
    });

    await expect(
      auth.signup({
        email: "abc@slate.dev",
        name: "Abc",
        password: "password12",
      }),
    ).rejects.toMatchObject({
      status: 409,
      code: "EMAIL_TAKEN",
    } satisfies Partial<HttpError>);
  });

  it("rejects a wrong password", async () => {
    const { auth } = createService();

    await auth.signup({
      email: "abc@slate.dev",
      name: "Abc",
      password: "password12",
    });

    await expect(
      auth.login({
        email: "abc@slate.dev",
        password: "not-the-correct-one",
      }),
    ).rejects.toMatchObject({
      status: 401,
      code: "INVALID_CREDENTIALS",
    });
  });

  it("logs in and never returns the password hash", async () => {
    const { auth } = createService();

    await auth.signup({
      email: "abc@slate.dev",
      name: "Abc",
      password: "password12",
    });

    const user = await auth.login({
      email: "Abc@slate.dev",
      password: "password12",
    });

    expect(user).toEqual({
      id: "user_1",
      email: "abc@slate.dev",
      name: "Abc",
    });
    expect(user).not.toHaveProperty("passwordHash");
  });
});
