import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "dev-secret-change-in-production-min-32-chars-long"
);

const DEMO_ACCOUNTS: Record<string, { id: string; email: string; role: string; nameDisplay: string; status: string }> = {
  creator: {
    id: "demo-creator-001",
    email: "creator@demo.pl",
    role: "CREATOR",
    nameDisplay: "Anna Kowalska",
    status: "ACTIVE",
  },
  restaurant: {
    id: "demo-restaurant-001",
    email: "restauracja@demo.pl",
    role: "RESTAURANT_OWNER",
    nameDisplay: "Jan Restaurator",
    status: "ACTIVE",
  },
  admin: {
    id: "demo-admin-001",
    email: "admin@demo.pl",
    role: "ADMIN",
    nameDisplay: "Admin CONTENT",
    status: "ACTIVE",
  },
};

export async function POST(request: Request) {
  try {
    const { account } = await request.json();

    const user = DEMO_ACCOUNTS[account];
    if (!user) {
      return NextResponse.json({ error: "Unknown demo account" }, { status: 400 });
    }

    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      role: user.role,
      nameDisplay: user.nameDisplay,
      status: user.status,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(SECRET);

    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    // Demo users skip onboarding
    cookieStore.set("onboarding_complete", "true", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({ user: { id: user.id, role: user.role } });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
