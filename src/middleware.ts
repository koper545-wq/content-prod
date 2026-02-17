import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "dev-secret-change-in-production-min-32-chars-long"
);

const PUBLIC_PATHS = ["/login", "/register", "/api/auth", "/api/seed", "/api/demo-login", "/oczekiwanie"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow static assets and API health
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname === "/api/health") {
    return NextResponse.next();
  }

  // Allow root landing page
  if (pathname === "/") {
    return NextResponse.next();
  }

  // Allow onboarding paths (pages + API)
  if (pathname.startsWith("/onboarding") || pathname.startsWith("/api/onboarding")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const role = payload.role as string;
    const userId = payload.id as string;

    // Public creator profiles — accessible by any authenticated user
    if (pathname.startsWith("/creators/")) {
      return NextResponse.next();
    }

    // RBAC route protection
    if (pathname.startsWith("/creator") && role !== "CREATOR") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (pathname.startsWith("/restaurant") && role !== "RESTAURANT_OWNER") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (pathname.startsWith("/api/creators")) {
      return NextResponse.next();
    }
    if (pathname.startsWith("/api/restaurant") && role !== "RESTAURANT_OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (pathname.startsWith("/api/admin") && role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Demo users skip onboarding gate
    if (userId.startsWith("demo-")) {
      return NextResponse.next();
    }

    // Onboarding gate: check cookie for non-admin, non-API paths
    if (role !== "ADMIN" && !pathname.startsWith("/api/")) {
      const onboardingComplete = request.cookies.get("onboarding_complete")?.value;
      if (onboardingComplete !== "true") {
        if (role === "CREATOR" && !pathname.startsWith("/onboarding")) {
          return NextResponse.redirect(new URL("/onboarding/creator", request.url));
        }
        if (role === "RESTAURANT_OWNER" && !pathname.startsWith("/onboarding")) {
          return NextResponse.redirect(new URL("/onboarding/restaurant", request.url));
        }
      }
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
