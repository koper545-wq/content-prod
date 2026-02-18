import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isDemoUser, getDemoRestaurants, getDemoRestaurantAgreements } from "@/lib/demo-data";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isDemoUser(session)) {
    const restaurants = getDemoRestaurants().filter(
      (r) => r.ownerUserId === session.id
    );
    const restaurantIds = restaurants.map((r) => r.id);
    const agreements = getDemoRestaurantAgreements(restaurantIds);
    return NextResponse.json({ agreements });
  }

  const restaurants = await prisma.restaurant.findMany({
    where: { ownerUserId: session.id },
    select: { id: true },
  });

  const restaurantIds = restaurants.map((r) => r.id);

  const agreements = await prisma.agreement.findMany({
    where: {
      booking: {
        restaurantId: { in: restaurantIds },
      },
    },
    include: {
      booking: {
        select: {
          id: true,
          creatorUserId: true,
          creator: {
            select: { id: true, nameDisplay: true, email: true },
          },
          restaurant: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ agreements });
}
