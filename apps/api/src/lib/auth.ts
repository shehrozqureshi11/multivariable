import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";

const accessSecret = () =>
  process.env.JWT_ACCESS_SECRET || "dev-access-secret-change-me-now!!";
const refreshSecret = () =>
  process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-me-now!";

export type JwtPayload = {
  sub: string;
  role: UserRole;
  email: string;
};

export function signAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, accessSecret(), {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m",
  });
}

export function signRefreshToken(payload: JwtPayload) {
  return jwt.sign(payload, refreshSecret(), {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d",
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, accessSecret()) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, refreshSecret()) as JwtPayload;
}
