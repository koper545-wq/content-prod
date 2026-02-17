import { NextResponse } from "next/server";
import { loginWithPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  // Rate limit: 10 login attempts per IP per minute
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!rateLimit(`login:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Zbyt wiele prób. Spróbuj za minutę." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
    }

    const user = await loginWithPassword(parsed.data.email, parsed.data.password);
    if (!user) {
      return NextResponse.json({ error: "Nieprawidłowy email lub hasło" }, { status: 401 });
    }

    if (user.status === "PENDING_VERIFICATION") {
      return NextResponse.json({ error: "Konto czeka na weryfikację przez administratora" }, { status: 403 });
    }

    if (user.status === "BANNED") {
      return NextResponse.json({ error: "Konto zostało zablokowane" }, { status: 403 });
    }

    if (user.status === "SUSPENDED" && user.suspendedUntil && user.suspendedUntil > new Date()) {
      return NextResponse.json({ error: "Konto jest zawieszone" }, { status: 403 });
    }

    await createSession({
      id: user.id,
      email: user.email,
      role: user.role,
      nameDisplay: user.nameDisplay,
      status: user.status,
    });

    // Check if onboarding is complete
    let onboardingComplete = false;
    if (user.role === "CREATOR") {
      const profile = await prisma.creatorProfile.findUnique({ where: { userId: user.id } });
      onboardingComplete = !!profile;
    } else if (user.role === "RESTAURANT_OWNER") {
      const restaurants = await prisma.restaurant.findFirst({ where: { ownerUserId: user.id } });
      onboardingComplete = !!restaurants;
    } else {
      // Admins skip onboarding
      onboardingComplete = true;
    }

    const cookieStore = await cookies();
    cookieStore.set("onboarding_complete", onboardingComplete ? "true" : "false", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({
      user: { id: user.id, role: user.role },
      onboardingComplete,
    });
  } catch {
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
