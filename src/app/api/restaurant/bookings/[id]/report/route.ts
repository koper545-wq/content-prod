import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isDemoUser } from "@/lib/demo-data";
import { z } from "zod";

const schema = z.object({
  type: z.enum(["NO_SHOW", "BAD_BEHAVIOR", "NO_CONTENT", "OTHER"]),
  description: z.string().min(10, "Opis musi mieć min. 10 znaków"),
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

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { restaurant: true },
  });

  if (!booking || booking.restaurant.ownerUserId !== session.id) {
    return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const report = await prisma.report.create({
    data: {
      bookingId: id,
      reporterRole: session.role,
      type: parsed.data.type,
      description: parsed.data.description,
    },
  });

  return NextResponse.json({ report }, { status: 201 });
}
