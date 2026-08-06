import jwt, { type SignOptions } from "jsonwebtoken";
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
  const options: SignOptions = {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES || "15m") as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, accessSecret(), options);
}

export function signRefreshToken(payload: JwtPayload) {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES || "7d") as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, refreshSecret(), options);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, accessSecret()) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, refreshSecret()) as JwtPayload;
}
