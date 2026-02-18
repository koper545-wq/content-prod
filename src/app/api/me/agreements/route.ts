import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isDemoUser, getDemoAgreements } from "@/lib/demo-data";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isDemoUser(session)) {
    const agreements = getDemoAgreements(session.id);
    return NextResponse.json({ agreements });
  }

  const agreements = await prisma.agreement.findMany({
    where: {
      booking: {
        creatorUserId: session.id,
      },
    },
    include: {
      booking: {
        select: {
          id: true,
          restaurant: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ agreements });
}
