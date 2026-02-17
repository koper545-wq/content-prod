import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isDemoUser } from "@/lib/demo-data";
import { notifyContentSubmitted } from "@/lib/notifications";
import { z } from "zod";

const schema = z.object({
  links: z.array(
    z.object({
      type: z.enum(["IG_REEL", "IG_STORY", "TIKTOK", "OTHER"]),
      url: z.string().url("Nieprawidłowy URL"),
    })
  ).min(1, "Dodaj przynajmniej jeden link"),
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
    return NextResponse.json({ ok: true });
  }

  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { campaign: true, restaurant: true },
  });

  if (!booking || booking.creatorUserId !== session.id) {
    return NextResponse.json({ error: "Nie znaleziono rezerwacji" }, { status: 404 });
  }

  if (booking.status !== "VISITED" && booking.status !== "CONTENT_PENDING") {
    return NextResponse.json({ error: "Nie można dodać contentu do tej rezerwacji" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.contentSubmission.create({
      data: {
        bookingId: id,
        linksJson: parsed.data.links,
      },
    }),
    prisma.booking.update({
      where: { id },
      data: { status: "CONTENT_SUBMITTED" },
    }),
  ]);

  await notifyContentSubmitted(
    booking.restaurant.ownerUserId,
    session.nameDisplay,
    booking.campaign.title,
    id
  );

  return NextResponse.json({ ok: true }, { status: 201 });
}
