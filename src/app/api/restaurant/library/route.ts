import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isDemoUser } from "@/lib/demo-data";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isDemoUser(session)) {
    return NextResponse.json({ bookings: [] });
  }

  const restaurants = await prisma.restaurant.findMany({
    where: { ownerUserId: session.id },
    select: { id: true },
  });

  const restaurantIds = restaurants.map((r) => r.id);

  // Get completed bookings with approved content submissions
  const bookings = await prisma.booking.findMany({
    where: {
      restaurantId: { in: restaurantIds },
      status: "COMPLETED",
      contentSubmission: { status: "APPROVED" },
    },
    include: {
      campaign: { select: { id: true, title: true, deliverablesJson: true } },
      creator: { select: { id: true, nameDisplay: true, creatorProfile: { select: { instagramUrl: true } } } },
      contentSubmission: true,
      assets: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ bookings });
}
