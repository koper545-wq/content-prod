import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isDemoUser } from "@/lib/demo-data";
import { notifyCreatorConfirmed } from "@/lib/notifications";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "CREATOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isDemoUser(session)) {
    return NextResponse.json({ ok: true });
  }

  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { campaign: true, restaurant: true },
  });

  if (!booking || booking.creatorUserId !== session.id) {
    return NextResponse.json({ error: "Nie znaleziono rezerwacji" }, { status: 404 });
  }

  if (booking.status !== "BOOKED" && booking.status !== "CONFIRMATION_PENDING") {
    return NextResponse.json({ error: "Nie można potwierdzić tej rezerwacji" }, { status: 400 });
  }

  await prisma.booking.update({
    where: { id },
    data: { status: "CONFIRMED" },
  });

  await notifyCreatorConfirmed(
    booking.restaurant.ownerUserId,
    session.nameDisplay,
    booking.campaign.title,
    id
  );

  return NextResponse.json({ ok: true });
}
