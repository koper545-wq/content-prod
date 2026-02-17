import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isDemoUser, getDemoCampaign, getDemoApplications, getDemoBookings, getDemoRestaurants } from "@/lib/demo-data";

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
      return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
    }
    const restaurant = getDemoRestaurants().find((r) => r.id === campaign.restaurantId);
    const applications = getDemoApplications(id);
    const bookings = getDemoBookings().filter((b) => b.campaignId === id);
    return NextResponse.json({
      campaign: {
        ...campaign,
        restaurant,
        applications,
        bookings,
      },
    });
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      restaurant: true,
      slots: { orderBy: { startAt: "asc" } },
      applications: {
        include: {
          creator: {
            select: { id: true, nameDisplay: true, email: true, creatorProfile: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      bookings: {
        include: {
          creator: { select: { id: true, nameDisplay: true, creatorProfile: true } },
          slot: true,
          contentSubmission: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!campaign || campaign.restaurant.ownerUserId !== session.id) {
    return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
  }

  return NextResponse.json({ campaign });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isDemoUser(session)) {
    return NextResponse.json({ campaign: { id: (await params).id, ...(await request.json()) } });
  }

  const { id } = await params;

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: { restaurant: true },
  });

  if (!campaign || campaign.restaurant.ownerUserId !== session.id) {
    return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
  }

  const body = await request.json();

  const updated = await prisma.campaign.update({
    where: { id },
    data: {
      ...(body.title && { title: body.title }),
      ...(body.descriptionShort && { descriptionShort: body.descriptionShort }),
      ...(body.descriptionDetails !== undefined && { descriptionDetails: body.descriptionDetails }),
      ...(body.offerValueDesc && { offerValueDesc: body.offerValueDesc }),
      ...(body.deliverables && { deliverablesJson: body.deliverables }),
      ...(body.requirements && { requirementsJson: body.requirements }),
      ...(body.status && { status: body.status }),
    },
  });

  return NextResponse.json({ campaign: updated });
}
