import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Response, Request } from "express";
import type { User } from "../drizzle/schema";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const localOpenId = (identifier: string) =>
  createHash("sha256").update(`local:${identifier.trim().toLowerCase()}`).digest("hex");

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  const expected = Buffer.from(key, "hex");
  const actual = Buffer.from(derivedKey, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export const hashResetToken = (token: string) => createHash("sha256").update(token).digest("hex");
export const createResetToken = () => randomBytes(32).toString("hex");

export function validatePassword(password: string) {
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
}

export async function setLocalSession(req: Request, res: Response, user: User) {
  const token = await sdk.signSession(
    { openId: user.openId, appId: "local-email", name: user.name || user.username || user.email || "" },
    { expiresInMs: ONE_YEAR_MS },
  );
  res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(req), maxAge: ONE_YEAR_MS });
}
