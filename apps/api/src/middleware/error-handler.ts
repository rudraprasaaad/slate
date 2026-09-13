import type { ApiErrorBody } from "@slate/contracts";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "../config/env";
import { HttpError } from "../lib/http-error";

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof ZodError) {
    const body: ApiErrorBody = {
      code: "VALIDATION_FAILED",
      message: "Check the highlighted fields",
      status: 422,
      details: { issues: error.issues },
    };
    res.status(422).json(body);
    return;
  }

  if (error instanceof HttpError) {
    const body: ApiErrorBody = {
      code: error.code,
      message: error.message,
      status: error.status,
      details: error.details,
    };
    res.status(error.status).json(body);
    return;
  }

  console.error(error);

  const body: ApiErrorBody = {
    code: "INTERNAL",
    message: "Something went wrong",
    status: 500,
    details:
      env.NODE_ENV === "development" ? { error: String(error) } : undefined,
  };
  res.status(500).json(body);
}
