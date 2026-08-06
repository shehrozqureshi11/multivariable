import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";
import { fail } from "@herdshare/shared";
import { verifyAccessToken, JwtPayload } from "../lib/auth";

export type AuthRequest = Request & { user?: JwtPayload };

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json(fail("UNAUTHORIZED", "Missing access token"));
  }
  try {
    req.user = verifyAccessToken(header.slice(7));
    next();
  } catch {
    return res.status(401).json(fail("UNAUTHORIZED", "Invalid or expired token"));
  }
}

export function requireRoles(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(fail("UNAUTHORIZED", "Not authenticated"));
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json(fail("FORBIDDEN", "Insufficient permissions"));
    }
    next();
  };
}
