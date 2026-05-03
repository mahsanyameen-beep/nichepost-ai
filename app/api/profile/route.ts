import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  findUserById,
  SESSION,
  toPublicUser,
  updateUser,
  verifySession,
} from "@/lib/auth";
import { validateProfilePayload } from "@/lib/validation";

function currentUserId(): string | null {
  const token = cookies().get(SESSION.cookieName)?.value;
  return verifySession(token);
}

export async function GET() {
  const userId = currentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const user = findUserById(userId);
  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }
  return NextResponse.json({ user: toPublicUser(user) });
}

export async function PUT(request: Request) {
  const userId = currentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const result = validateProfilePayload(body);
  if (!result.ok || !result.value) {
    return NextResponse.json(
      { error: result.errors[0]?.message ?? "Invalid input.", errors: result.errors },
      { status: 400 },
    );
  }

  const updated = updateUser(userId, {
    name: result.value.name,
    bio: result.value.bio,
    ...(result.value.avatarColor ? { avatarColor: result.value.avatarColor } : {}),
  });
  if (!updated) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }
  return NextResponse.json({ user: toPublicUser(updated) });
}
