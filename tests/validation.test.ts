import { describe, expect, it } from "vitest";
import {
  validateBio,
  validateEmail,
  validateLoginPayload,
  validateName,
  validatePassword,
  validateProfilePayload,
  validateSignupPayload,
} from "@/lib/validation";

describe("validateEmail", () => {
  it("rejects empty / missing", () => {
    expect(validateEmail("")).toMatch(/required/i);
    expect(validateEmail(undefined)).toMatch(/required/i);
    expect(validateEmail("   ")).toMatch(/required/i);
  });
  it("rejects malformed", () => {
    expect(validateEmail("nope")).toMatch(/valid/i);
    expect(validateEmail("a@b")).toMatch(/valid/i);
    expect(validateEmail("a@b.c")).toMatch(/valid/i);
  });
  it("accepts well-formed", () => {
    expect(validateEmail("ada@example.com")).toBeNull();
    expect(validateEmail("ada+tag@sub.example.io")).toBeNull();
  });
  it("rejects absurdly long", () => {
    expect(validateEmail("a".repeat(255) + "@x.com")).toMatch(/long/i);
  });
});

describe("validatePassword", () => {
  it("requires non-empty", () => {
    expect(validatePassword("")).toMatch(/required/i);
  });
  it("enforces minimum length", () => {
    expect(validatePassword("ab1xyz")).toMatch(/8 characters/i);
  });
  it("requires letters and numbers", () => {
    expect(validatePassword("abcdefghi")).toMatch(/letters and numbers/i);
    expect(validatePassword("123456789")).toMatch(/letters and numbers/i);
  });
  it("accepts a strong-enough password", () => {
    expect(validatePassword("hunter2pass")).toBeNull();
  });
});

describe("validateName", () => {
  it("rejects empty / too short", () => {
    expect(validateName("")).toMatch(/required/i);
    expect(validateName("a")).toMatch(/at least/i);
  });
  it("accepts a reasonable name", () => {
    expect(validateName("Ada")).toBeNull();
  });
});

describe("validateBio", () => {
  it("treats empty as valid", () => {
    expect(validateBio("")).toBeNull();
    expect(validateBio(null)).toBeNull();
    expect(validateBio(undefined)).toBeNull();
  });
  it("rejects too long", () => {
    expect(validateBio("x".repeat(281))).toMatch(/280/);
  });
});

describe("validateSignupPayload", () => {
  it("collects all field errors", () => {
    const r = validateSignupPayload({ name: "", email: "nope", password: "short" });
    expect(r.ok).toBe(false);
    expect(r.errors.map((e) => e.field)).toEqual(
      expect.arrayContaining(["name", "email", "password"]),
    );
  });
  it("normalizes valid input", () => {
    const r = validateSignupPayload({
      name: "  Ada  ",
      email: "ADA@Example.COM",
      password: "hunter2pass",
    });
    expect(r.ok).toBe(true);
    expect(r.value).toEqual({
      name: "Ada",
      email: "ada@example.com",
      password: "hunter2pass",
    });
  });
  it("rejects non-object body", () => {
    const r = validateSignupPayload(null);
    expect(r.ok).toBe(false);
  });
});

describe("validateLoginPayload", () => {
  it("requires email and password", () => {
    const r = validateLoginPayload({});
    expect(r.ok).toBe(false);
  });
  it("accepts valid input", () => {
    const r = validateLoginPayload({ email: "a@b.co", password: "x" });
    expect(r.ok).toBe(true);
    expect(r.value?.email).toBe("a@b.co");
  });
});

describe("validateProfilePayload", () => {
  it("requires a valid name", () => {
    const r = validateProfilePayload({ name: "", bio: "" });
    expect(r.ok).toBe(false);
  });
  it("rejects bad avatarColor", () => {
    const r = validateProfilePayload({ name: "Ada", bio: "", avatarColor: "purple" });
    expect(r.ok).toBe(false);
  });
  it("accepts a valid hex avatarColor", () => {
    const r = validateProfilePayload({
      name: "Ada",
      bio: "hi",
      avatarColor: "#7C3AED",
    });
    expect(r.ok).toBe(true);
    expect(r.value?.avatarColor).toBe("#7C3AED");
  });
});
