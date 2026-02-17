import { NextResponse } from "next/server";
import { destroySession } from "@/lib/session";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  await destroySession();
  const cookieStore = await cookies();
  cookieStore.delete("onboarding_complete");
  return NextResponse.redirect(new URL("/login", request.url));
}

export async function POST() {
  await destroySession();
  const cookieStore = await cookies();
  cookieStore.delete("onboarding_complete");
  return NextResponse.json({ ok: true });
}
