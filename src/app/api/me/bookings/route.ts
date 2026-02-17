import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isDemoUser, getDemoBookings } from "@/lib/demo-data";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "CREATOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isDemoUser(session)) {
    const bookings = getDemoBookings(session.id).map((b) => ({
      ...b,
      restaurant: { id: b.restaurantId, name: b.campaignId === "demo-camp-001" ? "Trattoria Bella" : "Sushi Zen", city: "Warszawa", addressLine: "ul. Marszałkowska 42" },
    }));
    return NextResponse.json({ bookings });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {
    creatorUserId: session.id,
  };

  if (status) {
    where.status = status;
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      campaign: {
        select: { id: true, title: true, deliverablesJson: true, contentDeadlineDays: true },
      },
      restaurant: {
        select: { id: true, name: true, city: true, addressLine: true },
      },
      slot: {
        select: { id: true, startAt: true, endAt: true },
      },
      contentSubmission: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ bookings });
}
