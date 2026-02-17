import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isDemoUser } from "@/lib/demo-data";
import { z } from "zod";

const schema = z.object({
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  capacity: z.number().min(1).max(10),
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

  const { id: campaignId } = await params;

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { restaurant: true },
  });

  if (!campaign || campaign.restaurant.ownerUserId !== session.id) {
    return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const slot = await prisma.slot.create({
    data: {
      campaignId,
      startAt: new Date(parsed.data.startAt),
      endAt: new Date(parsed.data.endAt),
      capacity: parsed.data.capacity,
    },
  });

  return NextResponse.json({ slot }, { status: 201 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: campaignId } = await params;
  const { searchParams } = new URL(request.url);
  const slotId = searchParams.get("slotId");

  if (!slotId) {
    return NextResponse.json({ error: "slotId is required" }, { status: 400 });
  }

  const slot = await prisma.slot.findUnique({
    where: { id: slotId },
    include: { campaign: { include: { restaurant: true } } },
  });

  if (!slot || slot.campaign.restaurant.ownerUserId !== session.id || slot.campaignId !== campaignId) {
    return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
  }

  if (slot.bookedCount > 0) {
    return NextResponse.json({ error: "Nie można usunąć terminu z rezerwacjami" }, { status: 400 });
  }

  await prisma.slot.delete({ where: { id: slotId } });

  return NextResponse.json({ ok: true });
}
