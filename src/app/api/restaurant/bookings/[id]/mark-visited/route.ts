import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isDemoUser } from "@/lib/demo-data";
import { addDays } from "date-fns";
import { notifyContentDue } from "@/lib/notifications";

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
    include: { campaign: true, restaurant: true },
  });

  if (!booking || booking.restaurant.ownerUserId !== session.id) {
    return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
  }

  if (booking.status !== "CONFIRMED") {
    return NextResponse.json({ error: "Rezerwacja nie została potwierdzona" }, { status: 400 });
  }

  const contentDueAt = addDays(new Date(), booking.campaign.contentDeadlineDays);

  await prisma.booking.update({
    where: { id },
    data: {
      status: "VISITED",
      contentDueAt,
    },
  });

  await notifyContentDue(
    booking.creatorUserId,
    booking.campaign.title,
    contentDueAt,
    id
  );

  return NextResponse.json({ ok: true });
}
