import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isDemoUser } from "@/lib/demo-data";
import { notifyApplicationAccepted } from "@/lib/notifications";
import { z } from "zod";
import { addHours } from "date-fns";

const schema = z.object({
  slotId: z.string().uuid(),
});

export async function POST(
  request: Request,
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

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      campaign: { include: { restaurant: true } },
      creator: true,
    },
  });

  if (!application || application.campaign.restaurant.ownerUserId !== session.id) {
    return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
  }

  if (application.status !== "APPLIED") {
    return NextResponse.json({ error: "Aplikacja już została rozpatrzona" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  // Check slot capacity
  const slot = await prisma.slot.findUnique({ where: { id: parsed.data.slotId } });
  if (!slot || slot.campaignId !== application.campaignId) {
    return NextResponse.json({ error: "Nieprawidłowy termin" }, { status: 400 });
  }

  if (slot.bookedCount >= slot.capacity) {
    return NextResponse.json({ error: "Termin jest pełny" }, { status: 400 });
  }

  const confirmBy = addHours(new Date(), application.campaign.confirmationRequiredHours);

  await prisma.$transaction([
    prisma.application.update({
      where: { id },
      data: { status: "ACCEPTED" },
    }),
    prisma.booking.create({
      data: {
        campaignId: application.campaignId,
        restaurantId: application.campaign.restaurantId,
        creatorUserId: application.creatorUserId,
        slotId: parsed.data.slotId,
        status: "BOOKED",
        confirmBy,
      },
    }),
    prisma.slot.update({
      where: { id: parsed.data.slotId },
      data: {
        bookedCount: { increment: 1 },
        ...(slot.bookedCount + 1 >= slot.capacity ? { status: "FULL" } : {}),
      },
    }),
  ]);

  await notifyApplicationAccepted(
    application.creatorUserId,
    application.campaign.title,
    application.campaignId
  );

  return NextResponse.json({ ok: true });
}
