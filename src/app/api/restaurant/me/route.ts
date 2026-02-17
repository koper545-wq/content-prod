import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { z } from "zod";
import { isDemoUser, getDemoRestaurants } from "@/lib/demo-data";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isDemoUser(session)) {
    return NextResponse.json({ restaurants: getDemoRestaurants() });
  }

  const restaurants = await prisma.restaurant.findMany({
    where: { ownerUserId: session.id },
  });

  return NextResponse.json({ restaurants });
}

const createSchema = z.object({
  name: z.string().min(2),
  addressLine: z.string().min(5),
  city: z.string().min(2),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  phone: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "RESTAURANT_OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const restaurant = await prisma.restaurant.create({
    data: {
      ownerUserId: session.id,
      name: parsed.data.name,
      addressLine: parsed.data.addressLine,
      city: parsed.data.city,
      instagramUrl: parsed.data.instagramUrl || null,
      websiteUrl: parsed.data.websiteUrl || null,
      phone: parsed.data.phone || null,
    },
  });

  return NextResponse.json({ restaurant }, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "RESTAURANT_OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, ...data } = body as { id: string; [key: string]: unknown };

  const restaurant = await prisma.restaurant.findFirst({
    where: { id, ownerUserId: session.id },
  });

  if (!restaurant) {
    return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
  }

  const updated = await prisma.restaurant.update({
    where: { id },
    data,
  });

  return NextResponse.json({ restaurant: updated });
}
