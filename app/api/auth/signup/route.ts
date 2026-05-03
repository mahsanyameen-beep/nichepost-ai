import { NextResponse } from "next/server";
import {
  buildSessionCookie,
  createUser,
  signSession,
  toPublicUser,
} from "@/lib/auth";
import { validateSignupPayload } from "@/lib/validation";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const result = validateSignupPayload(body);
  if (!result.ok || !result.value) {
    return NextResponse.json(
      { error: result.errors[0]?.message ?? "Invalid input.", errors: result.errors },
      { status: 400 },
    );
  }

  let user;
  try {
    user = createUser(result.value);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create account.";
    const status = /already exists/i.test(message) ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }

  const token = signSession(user.id);
  const res = NextResponse.json({ user: toPublicUser(user) }, { status: 201 });
  res.cookies.set(buildSessionCookie(token, true));
  return res;
}
