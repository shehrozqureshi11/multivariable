import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { fail } from "@herdshare/shared";

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json(fail("VALIDATION_ERROR", "Invalid request body", parsed.error.flatten()));
    }
    req.body = parsed.data;
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      return res
        .status(400)
        .json(fail("VALIDATION_ERROR", "Invalid query", parsed.error.flatten()));
    }
    (req as Request & { validatedQuery: unknown }).validatedQuery = parsed.data;
    next();
  };
}
