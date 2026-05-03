import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { findUserById, SESSION, toPublicUser, verifySession } from "@/lib/auth";

export async function GET() {
  const token = cookies().get(SESSION.cookieName)?.value;
  const userId = verifySession(token);
  if (!userId) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  const user = findUserById(userId);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  return NextResponse.json({ user: toPublicUser(user) });
}
