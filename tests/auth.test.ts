import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  buildSessionCookie,
  createUser,
  findUserByEmail,
  findUserById,
  hashPassword,
  signSession,
  toPublicUser,
  updateUser,
  userIdFromCookieHeader,
  verifyPassword,
  verifySession,
} from "@/lib/auth";

let tempDir: string;

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), "np-auth-"));
  process.env.AUTH_DATA_FILE = join(tempDir, "users.json");
  process.env.SESSION_SECRET = "test-secret-do-not-use-in-prod";
});

afterEach(() => {
  if (existsSync(tempDir)) {
    rmSync(tempDir, { recursive: true, force: true });
  }
  delete process.env.AUTH_DATA_FILE;
  delete process.env.SESSION_SECRET;
});

describe("password hashing", () => {
  it("produces a different hash with a fresh salt each time", () => {
    const a = hashPassword("hunter2pass");
    const b = hashPassword("hunter2pass");
    expect(a.salt).not.toBe(b.salt);
    expect(a.hash).not.toBe(b.hash);
  });
  it("verifies a correct password", () => {
    const { hash, salt } = hashPassword("hunter2pass");
    expect(verifyPassword("hunter2pass", salt, hash)).toBe(true);
  });
  it("rejects a wrong password", () => {
    const { hash, salt } = hashPassword("hunter2pass");
    expect(verifyPassword("wrong-password", salt, hash)).toBe(false);
  });
});

describe("user store", () => {
  it("creates a user and finds them by email + id", () => {
    const u = createUser({
      email: "Ada@Example.com",
      name: "Ada",
      password: "hunter2pass",
    });
    expect(u.email).toBe("ada@example.com");
    expect(findUserByEmail("ada@example.com")?.id).toBe(u.id);
    expect(findUserById(u.id)?.email).toBe("ada@example.com");
  });

  it("rejects duplicate email (case-insensitive)", () => {
    createUser({ email: "ada@example.com", name: "Ada", password: "hunter2pass" });
    expect(() =>
      createUser({ email: "ADA@example.com", name: "Ada2", password: "hunter2pass" }),
    ).toThrow(/already exists/i);
  });

  it("updates name, bio, and avatarColor", () => {
    const u = createUser({
      email: "ada@example.com",
      name: "Ada",
      password: "hunter2pass",
    });
    const updated = updateUser(u.id, {
      name: "Ada L.",
      bio: "Mathematician",
      avatarColor: "#22D3EE",
    });
    expect(updated?.name).toBe("Ada L.");
    expect(updated?.bio).toBe("Mathematician");
    expect(updated?.avatarColor).toBe("#22D3EE");
    expect(updated?.updatedAt).not.toBe(u.updatedAt);
  });

  it("toPublicUser strips secrets", () => {
    const u = createUser({
      email: "ada@example.com",
      name: "Ada",
      password: "hunter2pass",
    });
    const pub = toPublicUser(u);
    expect(pub).not.toHaveProperty("passwordHash");
    expect(pub).not.toHaveProperty("passwordSalt");
  });
});

describe("session tokens", () => {
  it("round-trips a valid token", () => {
    const token = signSession("user-123");
    expect(verifySession(token)).toBe("user-123");
  });
  it("rejects garbage", () => {
    expect(verifySession("not-a-token")).toBeNull();
    expect(verifySession(null)).toBeNull();
    expect(verifySession(undefined)).toBeNull();
    expect(verifySession("")).toBeNull();
  });
  it("rejects a tampered signature", () => {
    const token = signSession("user-123");
    const [payload, sig] = token.split(".");
    const flippedFirst = sig[0] === "A" ? "B" : "A";
    const tampered = `${payload}.${flippedFirst}${sig.slice(1)}`;
    expect(verifySession(tampered)).toBeNull();
  });
  it("rejects an expired token", () => {
    const longAgo = Date.now() - 1000 * 60 * 60 * 24 * 60;
    const token = signSession("user-123", longAgo);
    expect(verifySession(token)).toBeNull();
  });
});

describe("buildSessionCookie", () => {
  it("omits maxAge when remember=false (browser session cookie)", () => {
    const c = buildSessionCookie("token-x", false);
    expect(c.name).toBe("np_session");
    expect(c.httpOnly).toBe(true);
    expect(c.sameSite).toBe("lax");
    expect(c.path).toBe("/");
    expect(c.maxAge).toBeUndefined();
  });
  it("sets a 30-day maxAge when remember=true", () => {
    const c = buildSessionCookie("token-x", true);
    expect(c.maxAge).toBe(60 * 60 * 24 * 30);
  });
});

describe("userIdFromCookieHeader", () => {
  it("returns null for missing / malformed cookies", () => {
    expect(userIdFromCookieHeader(null)).toBeNull();
    expect(userIdFromCookieHeader("")).toBeNull();
    expect(userIdFromCookieHeader("other=1; nope=2")).toBeNull();
  });
  it("extracts and verifies a real session token", () => {
    const token = signSession("user-abc");
    const header = `theme=dark; np_session=${token}; lang=en`;
    expect(userIdFromCookieHeader(header)).toBe("user-abc");
  });
  it("rejects a tampered cookie value", () => {
    const token = signSession("user-abc");
    const header = `np_session=${token}garbage`;
    expect(userIdFromCookieHeader(header)).toBeNull();
  });
});
