import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isDemoUser } from "@/lib/demo-data";
import { z } from "zod";
import { addDays } from "date-fns";

const schema = z.object({
  action: z.enum(["resolve", "reject", "strike"]),
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

  const report = await prisma.report.findUnique({
    where: { id },
    include: { booking: { include: { creator: { include: { creatorProfile: true } } } } },
  });

  if (!report) {
    return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  if (parsed.data.action === "reject") {
    await prisma.report.update({
      where: { id },
      data: { status: "REJECTED", resolvedAt: new Date(), resolvedBy: session.id },
    });
    return NextResponse.json({ ok: true });
  }

  // Resolve or strike
  await prisma.report.update({
    where: { id },
    data: { status: "RESOLVED", resolvedAt: new Date(), resolvedBy: session.id },
  });

  if (parsed.data.action === "strike") {
    const creator = report.booking.creator;
    const profile = creator.creatorProfile;

    if (profile) {
      const newStrikesCount = profile.strikesCount + 1;

      await prisma.creatorProfile.update({
        where: { userId: creator.id },
        data: { strikesCount: newStrikesCount, strikesLastAt: new Date() },
      });

      // Strike system: 1 = 14 days, 2 = 30 days, 3+ = permanent ban
      if (newStrikesCount >= 3) {
        await prisma.user.update({
          where: { id: creator.id },
          data: { status: "BANNED" },
        });
      } else if (newStrikesCount === 2) {
        await prisma.user.update({
          where: { id: creator.id },
          data: { status: "SUSPENDED", suspendedUntil: addDays(new Date(), 30) },
        });
      } else {
        await prisma.user.update({
          where: { id: creator.id },
          data: { status: "SUSPENDED", suspendedUntil: addDays(new Date(), 14) },
        });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
