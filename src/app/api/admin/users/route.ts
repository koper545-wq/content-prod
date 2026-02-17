import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isDemoUser, getDemoUsers } from "@/lib/demo-data";

export async function GET(request: Request) {
  const session = await getSession();
  if (session && isDemoUser(session)) {
    const { searchParams } = new URL(request.url);
    const users = getDemoUsers({ status: searchParams.get("status") || undefined, role: searchParams.get("role") || undefined });
    return NextResponse.json({ users, total: users.length, page: 1, totalPages: 1 });
  }

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;

  const where: Record<string, unknown> = {};
  if (role) where.role = role;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { nameDisplay: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        nameDisplay: true,
        role: true,
        status: true,
        suspendedUntil: true,
        createdAt: true,
        lastLoginAt: true,
        creatorProfile: { select: { strikesCount: true, followerRange: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ users, total, page, totalPages: Math.ceil(total / limit) });
}
