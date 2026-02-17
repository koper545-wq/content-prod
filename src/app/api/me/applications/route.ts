import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isDemoUser, getDemoCreatorApplications } from "@/lib/demo-data";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "CREATOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isDemoUser(session)) {
    return NextResponse.json({ applications: getDemoCreatorApplications(session.id) });
  }

  const applications = await prisma.application.findMany({
    where: { creatorUserId: session.id },
    include: {
      campaign: {
        select: {
          id: true,
          title: true,
          descriptionShort: true,
          deliverablesJson: true,
          status: true,
          restaurant: { select: { id: true, name: true, city: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ applications });
}
