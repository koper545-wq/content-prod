import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isDemoUser, getDemoBookings } from "@/lib/demo-data";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isDemoUser(session)) {
    return NextResponse.json({ bookings: getDemoBookings() });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const campaignId = searchParams.get("campaignId");

  const restaurants = await prisma.restaurant.findMany({
    where: { ownerUserId: session.id },
    select: { id: true },
  });

  const restaurantIds = restaurants.map((r) => r.id);

  const where: Record<string, unknown> = {
    restaurantId: { in: restaurantIds },
  };

  if (status) where.status = status;
  if (campaignId) where.campaignId = campaignId;

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      creator: {
        select: { id: true, nameDisplay: true, email: true, creatorProfile: true },
      },
      campaign: { select: { id: true, title: true, deliverablesJson: true } },
      slot: { select: { id: true, startAt: true, endAt: true } },
      contentSubmission: true,
      agreement: { select: { id: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ bookings });
}
