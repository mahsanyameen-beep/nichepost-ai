import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { POST as signupPOST } from "@/app/api/auth/signup/route";
import { POST as loginPOST } from "@/app/api/auth/login/route";
import { POST as logoutPOST } from "@/app/api/auth/logout/route";
import { POST as generateContentPOST } from "@/app/api/generate-content/route";
import { POST as generateImagePOST } from "@/app/api/generate-image/route";

let tempDir: string;

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), "np-routes-"));
  process.env.AUTH_DATA_FILE = join(tempDir, "users.json");
  process.env.SESSION_SECRET = "test-secret-do-not-use-in-prod";
});

afterEach(() => {
  if (existsSync(tempDir)) rmSync(tempDir, { recursive: true, force: true });
  delete process.env.AUTH_DATA_FILE;
  delete process.env.SESSION_SECRET;
});

function jsonRequest(url: string, body: unknown): Request {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/signup", () => {
  it("rejects invalid JSON", async () => {
    const req = new Request("http://localhost/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{not json",
    });
    const res = await signupPOST(req);
    expect(res.status).toBe(400);
  });

  it("rejects bad input", async () => {
    const res = await signupPOST(
      jsonRequest("http://localhost/api/auth/signup", {
        name: "",
        email: "nope",
        password: "short",
      }),
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeTruthy();
    expect(Array.isArray(data.errors)).toBe(true);
  });

  it("creates an account, returns the public user, sets a cookie", async () => {
    const res = await signupPOST(
      jsonRequest("http://localhost/api/auth/signup", {
        name: "Ada",
        email: "ada@example.com",
        password: "hunter2pass",
      }),
    );
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.user.email).toBe("ada@example.com");
    expect(data.user.passwordHash).toBeUndefined();
    const cookie = res.headers.get("set-cookie");
    expect(cookie).toMatch(/np_session=/);
    expect(cookie).toMatch(/HttpOnly/i);
  });

  it("rejects duplicate signup", async () => {
    const body = { name: "Ada", email: "ada@example.com", password: "hunter2pass" };
    await signupPOST(jsonRequest("http://localhost/api/auth/signup", body));
    const dup = await signupPOST(jsonRequest("http://localhost/api/auth/signup", body));
    expect(dup.status).toBe(409);
  });
});

describe("POST /api/auth/login", () => {
  async function seed() {
    await signupPOST(
      jsonRequest("http://localhost/api/auth/signup", {
        name: "Ada",
        email: "ada@example.com",
        password: "hunter2pass",
      }),
    );
  }

  it("rejects unknown email", async () => {
    await seed();
    const res = await loginPOST(
      jsonRequest("http://localhost/api/auth/login", {
        email: "nope@example.com",
        password: "hunter2pass",
      }),
    );
    expect(res.status).toBe(401);
  });

  it("rejects wrong password", async () => {
    await seed();
    const res = await loginPOST(
      jsonRequest("http://localhost/api/auth/login", {
        email: "ada@example.com",
        password: "wrong-password",
      }),
    );
    expect(res.status).toBe(401);
  });

  it("logs in with correct credentials and sets a session cookie", async () => {
    await seed();
    const res = await loginPOST(
      jsonRequest("http://localhost/api/auth/login", {
        email: "ada@example.com",
        password: "hunter2pass",
      }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.user.email).toBe("ada@example.com");
    const cookie = res.headers.get("set-cookie");
    expect(cookie).toMatch(/np_session=/);
  });

  it("without remember=true the cookie has no Max-Age (session cookie)", async () => {
    await seed();
    const res = await loginPOST(
      jsonRequest("http://localhost/api/auth/login", {
        email: "ada@example.com",
        password: "hunter2pass",
      }),
    );
    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie).toMatch(/np_session=/);
    expect(cookie).not.toMatch(/Max-Age=/i);
    expect(cookie).not.toMatch(/Expires=/i);
  });

  it("with remember=true the cookie has a 30-day Max-Age", async () => {
    await seed();
    const res = await loginPOST(
      jsonRequest("http://localhost/api/auth/login", {
        email: "ada@example.com",
        password: "hunter2pass",
        remember: true,
      }),
    );
    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie).toMatch(/np_session=/);
    expect(cookie).toMatch(/Max-Age=2592000/i);
  });

  it("rejects bad input", async () => {
    const res = await loginPOST(
      jsonRequest("http://localhost/api/auth/login", { email: "nope", password: "" }),
    );
    expect(res.status).toBe(400);
  });
});

describe("generate routes require auth", () => {
  it("POST /api/generate-content returns 401 without a session cookie", async () => {
    const res = await generateContentPOST(
      jsonRequest("http://localhost/api/generate-content", {
        niche: "indie game devs",
        platform: "Twitter",
        tone: "Casual",
      }),
    );
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toMatch(/signed in/i);
  });

  it("POST /api/generate-image returns 401 without a session cookie", async () => {
    const res = await generateImagePOST(
      jsonRequest("http://localhost/api/generate-image", {
        niche: "indie game devs",
        platform: "Twitter",
        tone: "Casual",
      }),
    );
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toMatch(/signed in/i);
  });

  it("POST /api/generate-content with a tampered session cookie still 401s", async () => {
    const req = new Request("http://localhost/api/generate-content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: "np_session=not-a-real-token",
      },
      body: JSON.stringify({
        niche: "indie game devs",
        platform: "Twitter",
        tone: "Casual",
      }),
    });
    const res = await generateContentPOST(req);
    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/logout", () => {
  it("clears the session cookie", async () => {
    const res = await logoutPOST();
    expect(res.status).toBe(200);
    const cookie = res.headers.get("set-cookie");
    expect(cookie).toMatch(/np_session=/);
    expect(cookie).toMatch(/Max-Age=0/);
  });
});
