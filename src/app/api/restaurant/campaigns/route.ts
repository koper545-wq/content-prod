import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { z } from "zod";
import { isDemoUser, getAllDemoCampaigns } from "@/lib/demo-data";

const createSchema = z.object({
  restaurantId: z.string().uuid(),
  title: z.string().min(3, "Tytuł musi mieć min. 3 znaki"),
  descriptionShort: z.string().min(10, "Opis musi mieć min. 10 znaków"),
  descriptionDetails: z.string().optional(),
  offerValueDesc: z.string().min(3, "Opisz wartość oferty"),
  deliverables: z.object({
    reel: z.number().min(0).optional(),
    stories: z.number().min(0).optional(),
    photos: z.number().min(0).optional(),
  }),
  requirements: z.object({
    minFollowers: z.string().optional(),
    niches: z.array(z.string()).optional(),
  }).optional(),
  contentDeadlineDays: z.number().min(1).max(30).optional(),
  cancellationPolicy: z.enum(["FLEX", "STRICT"]).optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isDemoUser(session)) {
    return NextResponse.json({ campaigns: getAllDemoCampaigns() });
  }

  const restaurants = await prisma.restaurant.findMany({
    where: { ownerUserId: session.id },
    select: { id: true },
  });

  const restaurantIds = restaurants.map((r) => r.id);

  const campaigns = await prisma.campaign.findMany({
    where: { restaurantId: { in: restaurantIds } },
    include: {
      restaurant: { select: { id: true, name: true } },
      _count: { select: { applications: true, bookings: true, slots: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ campaigns });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  // Verify restaurant ownership
  const restaurant = await prisma.restaurant.findFirst({
    where: { id: parsed.data.restaurantId, ownerUserId: session.id },
  });

  if (!restaurant) {
    return NextResponse.json({ error: "Restauracja nie znaleziona" }, { status: 404 });
  }

  const campaign = await prisma.campaign.create({
    data: {
      restaurantId: parsed.data.restaurantId,
      title: parsed.data.title,
      descriptionShort: parsed.data.descriptionShort,
      descriptionDetails: parsed.data.descriptionDetails,
      offerValueDesc: parsed.data.offerValueDesc,
      deliverablesJson: parsed.data.deliverables,
      requirementsJson: parsed.data.requirements || {},
      contentDeadlineDays: parsed.data.contentDeadlineDays || 7,
      cancellationPolicy: parsed.data.cancellationPolicy || "FLEX",
      status: "DRAFT",
    },
  });

  return NextResponse.json({ campaign }, { status: 201 });
}
