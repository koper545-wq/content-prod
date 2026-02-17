import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isDemoUser, getDemoReports } from "@/lib/demo-data";

export async function GET(request: Request) {
  const session = await getSession();
  if (session && isDemoUser(session)) {
    return NextResponse.json({ reports: getDemoReports() });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "OPEN";

  const reports = await prisma.report.findMany({
    where: { status: status as "OPEN" | "RESOLVED" | "REJECTED" },
    include: {
      booking: {
        include: {
          creator: { select: { id: true, nameDisplay: true, email: true } },
          campaign: { select: { id: true, title: true } },
          restaurant: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ reports });
}
