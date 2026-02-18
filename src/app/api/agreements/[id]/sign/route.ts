import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isDemoUser } from "@/lib/demo-data";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isDemoUser(session)) {
    return NextResponse.json({ ok: true });
  }

  const { id } = await params;

  const agreement = await prisma.agreement.findUnique({
    where: { id },
    include: { booking: true },
  });

  if (!agreement) {
    return NextResponse.json({ error: "Nie znaleziono umowy" }, { status: 404 });
  }

  // Determine if user is restaurant owner or creator
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: agreement.booking.restaurantId },
    select: { ownerUserId: true },
  });
  const isRestaurantOwner = restaurant?.ownerUserId === session.id;
  const isCreator = agreement.booking.creatorUserId === session.id;

  if (!isRestaurantOwner && !isCreator) {
    return NextResponse.json({ error: "Brak dostępu" }, { status: 403 });
  }

  // Restaurant owner signs when status is PENDING_RESTAURANT
  if (isRestaurantOwner && agreement.status === "PENDING_RESTAURANT") {
    const updated = await prisma.agreement.update({
      where: { id },
      data: {
        status: "PENDING_CREATOR",
        restaurantSignedAt: new Date(),
      },
    });
    return NextResponse.json({ agreement: updated });
  }

  // Creator signs when status is PENDING_CREATOR
  if (isCreator && agreement.status === "PENDING_CREATOR") {
    const updated = await prisma.agreement.update({
      where: { id },
      data: {
        status: "SIGNED",
        creatorSignedAt: new Date(),
      },
    });
    return NextResponse.json({ agreement: updated });
  }

  return NextResponse.json(
    { error: "Nie można podpisać umowy w obecnym stanie" },
    { status: 400 }
  );
}
