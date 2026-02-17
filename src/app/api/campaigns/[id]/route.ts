import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isDemoUser, getDemoCampaign, getDemoCreatorApplications } from "@/lib/demo-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (isDemoUser(session)) {
    const campaign = getDemoCampaign(id);
    if (!campaign) {
      return NextResponse.json({ error: "Nie znaleziono kampanii" }, { status: 404 });
    }
    const restaurant = campaign.restaurant as Record<string, unknown>;
    const fullCampaign = { ...campaign, restaurant: { ...restaurant, addressLine: "ul. Marszałkowska 42", websiteUrl: "https://trattoriabella.pl" } };
    const apps = getDemoCreatorApplications(session.id);
    const existingApplication = apps.find((a) => a.campaignId === id) ? { id: apps.find((a) => a.campaignId === id)!.id, status: apps.find((a) => a.campaignId === id)!.status } : null;
    return NextResponse.json({ campaign: fullCampaign, existingApplication });
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      restaurant: {
        select: { id: true, name: true, city: true, addressLine: true, instagramUrl: true, websiteUrl: true },
      },
      slots: {
        where: { status: "OPEN" },
        orderBy: { startAt: "asc" },
        select: { id: true, startAt: true, endAt: true, capacity: true, bookedCount: true },
      },
    },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Nie znaleziono kampanii" }, { status: 404 });
  }

  // Check if creator already applied
  let existingApplication = null;
  if (session.role === "CREATOR") {
    existingApplication = await prisma.application.findUnique({
      where: {
        campaignId_creatorUserId: { campaignId: id, creatorUserId: session.id },
      },
      select: { id: true, status: true },
    });
  }

  return NextResponse.json({ campaign, existingApplication });
}
