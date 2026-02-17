import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isDemoUser, getDemoCampaigns } from "@/lib/demo-data";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isDemoUser(session)) {
    const campaigns = getDemoCampaigns();
    return NextResponse.json({ campaigns, total: campaigns.length, page: 1, totalPages: 1 });
  }

  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  const niche = searchParams.get("niche");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 12;

  const where: Record<string, unknown> = {
    status: "ACTIVE",
  };

  if (city) {
    where.restaurant = { city: { contains: city, mode: "insensitive" } };
  }

  if (niche) {
    where.requirementsJson = { path: ["niches"], array_contains: [niche] };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { descriptionShort: { contains: search, mode: "insensitive" } },
    ];
  }

  const [campaigns, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      include: {
        restaurant: { select: { id: true, name: true, city: true, instagramUrl: true } },
        slots: { where: { status: "OPEN" }, select: { id: true, startAt: true, endAt: true, capacity: true, bookedCount: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.campaign.count({ where }),
  ]);

  return NextResponse.json({ campaigns, total, page, totalPages: Math.ceil(total / limit) });
}
