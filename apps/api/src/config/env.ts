import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(16),
  WEB_ORIGIN: z.url().default("http://localhost:3000"),
});

export const env = envSchema.parse(process.env);
