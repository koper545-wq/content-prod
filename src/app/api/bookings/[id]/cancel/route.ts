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

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { slot: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "Nie znaleziono rezerwacji" }, { status: 404 });
  }

  // Creators can cancel their own bookings
  if (session.role === "CREATOR" && booking.creatorUserId !== session.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const cancelStatus =
    session.role === "CREATOR" ? "CANCELLED_BY_CREATOR" : "CANCELLED_BY_RESTAURANT";

  if (!["BOOKED", "CONFIRMATION_PENDING", "CONFIRMED"].includes(booking.status)) {
    return NextResponse.json({ error: "Nie można anulować tej rezerwacji" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.booking.update({
      where: { id },
      data: { status: cancelStatus },
    }),
    prisma.slot.update({
      where: { id: booking.slotId },
      data: { bookedCount: { decrement: 1 } },
    }),
  ]);

  // Reopen slot if it was full
  const slot = await prisma.slot.findUnique({ where: { id: booking.slotId } });
  if (slot && slot.bookedCount < slot.capacity && slot.status === "FULL") {
    await prisma.slot.update({ where: { id: slot.id }, data: { status: "OPEN" } });
  }

  return NextResponse.json({ ok: true });
}
