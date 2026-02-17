import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isDemoUser } from "@/lib/demo-data";
import { notifyNewApplication } from "@/lib/notifications";
import { z } from "zod";

const schema = z.object({
  message: z.string().max(500).optional(),
  preferredSlotIds: z.array(z.string()).min(1, "Wybierz przynajmniej jeden termin"),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "CREATOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isDemoUser(session)) {
    return NextResponse.json({ application: { id: "demo-app-new", status: "APPLIED" } });
  }

  const { id: campaignId } = await params;

  // Check user status
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { creatorProfile: true },
  });

  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Konto jest nieaktywne" }, { status: 403 });
  }

  if (!user.creatorProfile) {
    return NextResponse.json({ error: "Uzupełnij profil twórcy" }, { status: 400 });
  }

  // Check if suspended
  if (user.suspendedUntil && user.suspendedUntil > new Date()) {
    return NextResponse.json({ error: "Konto jest zawieszone" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  // Check campaign exists and is active
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { restaurant: true },
  });

  if (!campaign || campaign.status !== "ACTIVE") {
    return NextResponse.json({ error: "Kampania niedostępna" }, { status: 404 });
  }

  // Check duplicate application
  const existing = await prisma.application.findUnique({
    where: {
      campaignId_creatorUserId: { campaignId, creatorUserId: session.id },
    },
  });

  if (existing) {
    return NextResponse.json({ error: "Już aplikowałeś na tę kampanię" }, { status: 409 });
  }

  const application = await prisma.application.create({
    data: {
      campaignId,
      creatorUserId: session.id,
      message: parsed.data.message,
      preferredSlotIds: parsed.data.preferredSlotIds,
    },
  });

  // Notify restaurant owner
  await notifyNewApplication(campaign.restaurant.ownerUserId, campaign.title, campaignId);

  return NextResponse.json({ application }, { status: 201 });
}
