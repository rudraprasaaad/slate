import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string(),
});
export type UserDTO = z.infer<typeof userSchema>;

export const signupInput = z.object({
  email: z.email(),
  name: z.string().min(1).max(60),
  password: z.string().min(8).max(72),
});
export type SignupInput = z.infer<typeof signupInput>;

export const loginInput = z.object({
  email: z.email(),
  password: z.string().min(8).max(72),
});
export type LoginInput = z.infer<typeof loginInput>;

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  status: z.number(),
  details: z.record(z.string(), z.unknown()).optional(),
});
export type ApiErrorBody = z.infer<typeof apiErrorSchema>;
