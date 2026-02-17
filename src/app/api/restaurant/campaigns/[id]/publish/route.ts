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

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: { restaurant: true, slots: true },
  });

  if (!campaign || campaign.restaurant.ownerUserId !== session.id) {
    return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
  }

  if (campaign.status !== "DRAFT" && campaign.status !== "PAUSED") {
    return NextResponse.json({ error: "Kampania nie może zostać opublikowana" }, { status: 400 });
  }

  if (campaign.slots.length === 0) {
    return NextResponse.json({ error: "Dodaj przynajmniej jeden termin" }, { status: 400 });
  }

  await prisma.campaign.update({
    where: { id },
    data: { status: "ACTIVE" },
  });

  return NextResponse.json({ ok: true });
}
