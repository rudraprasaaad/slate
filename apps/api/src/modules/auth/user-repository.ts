import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { schema } from "../../db";
import { eq } from "drizzle-orm";
import { users } from "../../db/schema";

type Database = PostgresJsDatabase<typeof schema>;

export class UserRepository {
  constructor(private readonly db: Database) {}

  findByEmail(email: string) {
    return this.db.query.users.findFirst({
      where: eq(users.email, email),
    });
  }

  findById(id: string) {
    return this.db.query.users.findFirst({
      where: eq(users.id, id),
      columns: {
        id: true,
        email: true,
        name: true,
      },
    });
  }

  async create(
    input: Pick<typeof users.$inferInsert, "email" | "name" | "passwordHash">,
  ) {
    const [user] = await this.db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email: input.email,
        name: input.name,
        passwordHash: input.passwordHash,
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
      });

    if (!user) throw new Error("Insert did not return the created user");

    return user;
  }
}
