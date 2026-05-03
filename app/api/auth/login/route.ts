import { NextResponse } from "next/server";
import {
  buildSessionCookie,
  findUserByEmail,
  signSession,
  toPublicUser,
  verifyPassword,
} from "@/lib/auth";
import { validateLoginPayload } from "@/lib/validation";

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

  const result = validateLoginPayload(body);
  if (!result.ok || !result.value) {
    return NextResponse.json(
      { error: result.errors[0]?.message ?? "Invalid input.", errors: result.errors },
      { status: 400 },
    );
  }

  const user = findUserByEmail(result.value.email);
  const passwordOk =
    user && verifyPassword(result.value.password, user.passwordSalt, user.passwordHash);

  if (!user || !passwordOk) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 },
    );
  }

  const token = signSession(user.id);
  const res = NextResponse.json({ user: toPublicUser(user) });
  res.cookies.set(buildSessionCookie(token, result.value.remember));
  return res;
}
