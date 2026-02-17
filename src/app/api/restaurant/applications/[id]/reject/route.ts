import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isDemoUser } from "@/lib/demo-data";

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

  const application = await prisma.application.findUnique({
    where: { id },
    include: { campaign: { include: { restaurant: true } } },
  });

  if (!application || application.campaign.restaurant.ownerUserId !== session.id) {
    return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
  }

  if (application.status !== "APPLIED") {
    return NextResponse.json({ error: "Aplikacja już została rozpatrzona" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const reason = (body as { reason?: string }).reason;

  await prisma.application.update({
    where: { id },
    data: {
      status: "REJECTED",
      rejectionReason: reason || null,
    },
  });

  return NextResponse.json({ ok: true });
}
