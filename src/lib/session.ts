import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./prisma";
import type { UserRole } from "@/generated/prisma";

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "dev-secret-change-in-production-min-32-chars-long"
);

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  nameDisplay: string;
  status: string;
}

export async function createSession(user: {
  id: string;
  email: string;
  role: UserRole;
  nameDisplay: string;
  status: string;
}) {
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

  return token;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function getSessionOrThrow(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function getFullUser(sessionUser: SessionUser) {
  return prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: { creatorProfile: true, restaurants: true },
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
