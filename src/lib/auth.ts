import { prisma } from "./prisma";
import { v4 as uuid } from "uuid";
import { addMinutes } from "date-fns";
import bcrypt from "bcryptjs";
import type { UserRole } from "@/generated/prisma";

const MAGIC_LINK_EXPIRY_MINUTES = 15;

export async function createMagicLink(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const token = uuid();
  await prisma.magicLink.create({
    data: {
      userId: user.id,
      token,
      expiresAt: addMinutes(new Date(), MAGIC_LINK_EXPIRY_MINUTES),
    },
  });
  return { token, user };
}

export async function verifyMagicLink(token: string) {
  const link = await prisma.magicLink.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!link) return null;
  if (link.usedAt) return null;
  if (link.expiresAt < new Date()) return null;

  await prisma.magicLink.update({
    where: { id: link.id },
    data: { usedAt: new Date() },
  });

  await prisma.user.update({
    where: { id: link.userId },
    data: { lastLoginAt: new Date() },
  });

  return link.user;
}

export async function registerUser(data: {
  email: string;
  name: string;
  role: UserRole;
  password?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) return { error: "Email jest już zajęty" };

  const passwordHash = data.password
    ? await bcrypt.hash(data.password, 10)
    : null;

  const user = await prisma.user.create({
    data: {
      email: data.email,
      nameDisplay: data.name,
      role: data.role,
      passwordHash,
      status: "PENDING_VERIFICATION",
    },
  });

  return { user };
}

export async function loginWithPassword(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return user;
}

export function canAccess(userRole: UserRole, allowedRoles: UserRole[]) {
  return allowedRoles.includes(userRole);
}
