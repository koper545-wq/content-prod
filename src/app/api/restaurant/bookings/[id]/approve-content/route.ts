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
    include: { restaurant: true, contentSubmission: true },
  });

  if (!booking || booking.restaurant.ownerUserId !== session.id) {
    return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
  }

  if (booking.status !== "CONTENT_SUBMITTED" || !booking.contentSubmission) {
    return NextResponse.json({ error: "Brak contentu do zatwierdzenia" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.contentSubmission.update({
      where: { id: booking.contentSubmission.id },
      data: { status: "APPROVED", restaurantApprovedAt: new Date() },
    }),
    prisma.booking.update({
      where: { id },
      data: { status: "COMPLETED" },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
