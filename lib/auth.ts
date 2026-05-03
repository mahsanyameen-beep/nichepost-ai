import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  passwordSalt: string;
  bio: string;
  avatarColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  bio: string;
  avatarColor: string;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_DATA_PATH = join(process.cwd(), "data", "users.json");
const SESSION_COOKIE = "np_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const REMEMBER_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const SESSION_DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24;
const AVATAR_COLORS = [
  "#7C3AED",
  "#A855F7",
  "#FFA34D",
  "#22D3EE",
  "#34D399",
  "#F472B6",
];

function dataPath(): string {
  return process.env.AUTH_DATA_FILE || DEFAULT_DATA_PATH;
}

function sessionSecret(): string {
  return (
    process.env.SESSION_SECRET ||
    "dev-only-session-secret-change-me-in-production-please"
  );
}

function readStore(): UserRecord[] {
  const path = dataPath();
  if (!existsSync(path)) return [];
  try {
    const raw = readFileSync(path, "utf8");
    if (!raw.trim()) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as UserRecord[]) : [];
  } catch {
    return [];
  }
}

function writeStore(users: UserRecord[]): void {
  const path = dataPath();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(users, null, 2), "utf8");
}

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const useSalt = salt ?? randomBytes(16).toString("hex");
  const derived = scryptSync(password, useSalt, 64).toString("hex");
  return { hash: derived, salt: useSalt };
}

export function verifyPassword(password: string, salt: string, hash: string): boolean {
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

export function toPublicUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    bio: user.bio,
    avatarColor: user.avatarColor,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function findUserByEmail(email: string): UserRecord | null {
  const lower = email.trim().toLowerCase();
  return readStore().find((u) => u.email === lower) ?? null;
}

export function findUserById(id: string): UserRecord | null {
  return readStore().find((u) => u.id === id) ?? null;
}

export function createUser(input: {
  email: string;
  name: string;
  password: string;
}): UserRecord {
  const lower = input.email.trim().toLowerCase();
  const users = readStore();
  if (users.some((u) => u.email === lower)) {
    throw new Error("An account with that email already exists.");
  }
  const { hash, salt } = hashPassword(input.password);
  const now = new Date().toISOString();
  const user: UserRecord = {
    id: randomBytes(12).toString("hex"),
    email: lower,
    name: input.name.trim(),
    passwordHash: hash,
    passwordSalt: salt,
    bio: "",
    avatarColor: AVATAR_COLORS[users.length % AVATAR_COLORS.length],
    createdAt: now,
    updatedAt: now,
  };
  users.push(user);
  writeStore(users);
  return user;
}

export function updateUser(
  id: string,
  patch: Partial<Pick<UserRecord, "name" | "bio" | "avatarColor">>,
): UserRecord | null {
  const users = readStore();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  const next: UserRecord = {
    ...users[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  users[idx] = next;
  writeStore(users);
  return next;
}

function base64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64url(input: string): Buffer {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

export function signSession(userId: string, issuedAt = Date.now()): string {
  const payload = base64url(Buffer.from(JSON.stringify({ uid: userId, iat: issuedAt })));
  const sig = base64url(
    createHmac("sha256", sessionSecret()).update(payload).digest(),
  );
  return `${payload}.${sig}`;
}

export function verifySession(token: string | undefined | null): string | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expected = base64url(
    createHmac("sha256", sessionSecret()).update(payload).digest(),
  );
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expBuf)) return null;
  try {
    const decoded = JSON.parse(fromBase64url(payload).toString("utf8")) as {
      uid?: string;
      iat?: number;
    };
    if (!decoded.uid || typeof decoded.iat !== "number") return null;
    if (Date.now() - decoded.iat > SESSION_MAX_AGE_SECONDS * 1000) return null;
    return decoded.uid;
  } catch {
    return null;
  }
}

export const SESSION = {
  cookieName: SESSION_COOKIE,
  maxAgeSeconds: SESSION_MAX_AGE_SECONDS,
  rememberMaxAgeSeconds: REMEMBER_MAX_AGE_SECONDS,
  defaultMaxAgeSeconds: SESSION_DEFAULT_MAX_AGE_SECONDS,
};

/**
 * Read + verify a session token from a raw cookie header (e.g. request.headers.get("cookie")).
 * Works in any runtime — does NOT depend on next/headers.
 */
export function userIdFromCookieHeader(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(/;\s*/);
  for (const part of parts) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const name = part.slice(0, eq).trim();
    if (name !== SESSION_COOKIE) continue;
    const value = decodeURIComponent(part.slice(eq + 1));
    return verifySession(value);
  }
  return null;
}

export interface SessionCookieOptions {
  name: string;
  value: string;
  httpOnly: true;
  sameSite: "lax";
  secure: boolean;
  path: "/";
  maxAge?: number;
}

export function buildSessionCookie(
  token: string,
  remember: boolean,
): SessionCookieOptions {
  const opts: SessionCookieOptions = {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
  if (remember) opts.maxAge = REMEMBER_MAX_AGE_SECONDS;
  return opts;
}
