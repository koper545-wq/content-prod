import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isDemoUser } from "@/lib/demo-data";
import { notifyApplicationAccepted, notifyAgreementReady } from "@/lib/notifications";
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
      creator: { include: { creatorProfile: true } },
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
  const restaurant = application.campaign.restaurant;
  const campaign = application.campaign;
  const creatorProfile = application.creator.creatorProfile;

  // Interactive transaction: create booking + agreement + update slot
  const result = await prisma.$transaction(async (tx) => {
    await tx.application.update({
      where: { id },
      data: { status: "ACCEPTED" },
    });

    const booking = await tx.booking.create({
      data: {
        campaignId: application.campaignId,
        restaurantId: campaign.restaurantId,
        creatorUserId: application.creatorUserId,
        slotId: parsed.data.slotId,
        status: "BOOKED",
        confirmBy,
      },
    });

    await tx.slot.update({
      where: { id: parsed.data.slotId },
      data: {
        bookedCount: { increment: 1 },
        ...(slot.bookedCount + 1 >= slot.capacity ? { status: "FULL" } : {}),
      },
    });

    // Auto-create agreement with snapshot data
    const agreement = await tx.agreement.create({
      data: {
        bookingId: booking.id,
        campaignTitle: campaign.title,
        restaurantCompanyName: restaurant.companyName || restaurant.name,
        restaurantNip: restaurant.nip || "BRAK",
        restaurantAddress: restaurant.companyAddress || `${restaurant.addressLine}, ${restaurant.city}`,
        creatorFullName: creatorProfile?.fullName || application.creator.nameDisplay,
        creatorPesel: creatorProfile?.pesel || "BRAK",
        deliverablesJson: campaign.deliverablesJson as object,
        offerDescription: campaign.offerValueDesc,
        contentDeadlineDays: campaign.contentDeadlineDays,
        status: "PENDING_RESTAURANT",
      },
    });

    return { booking, agreement };
  });

  // Send notifications (outside transaction)
  await notifyApplicationAccepted(
    application.creatorUserId,
    campaign.title,
    application.campaignId
  );

  await notifyAgreementReady(
    application.creatorUserId,
    campaign.title,
    result.agreement.id
  );

  return NextResponse.json({ ok: true });
}
